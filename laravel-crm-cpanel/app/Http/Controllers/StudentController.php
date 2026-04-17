<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Document;
use App\Models\Student;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\View\View;

class StudentController extends Controller
{
    public function index(Request $request): View
    {
        $user = $this->authUser($request);
        $q = (string) $request->query('q', '');
        $stage = (string) $request->query('stage', '');
        $country = (string) $request->query('country', '');
        $gpaMin = $request->query('gpa_min');
        $gpaMax = $request->query('gpa_max');

        $students = Student::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->whereNull('deleted_at')
            ->when($q !== '', fn ($query) => $query->where(function ($sub) use ($q) {
                $sub->where('full_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhere('field_of_study', 'like', "%{$q}%");
            }))
            ->when($stage !== '', fn ($query) => $query->where('stage', $stage))
            ->when($country !== '', fn ($query) => $query->where('target_country', 'like', "%{$country}%"))
            ->when($gpaMin !== null && $gpaMin !== '', fn ($query) => $query->where('gpa', '>=', (float) $gpaMin))
            ->when($gpaMax !== null && $gpaMax !== '', fn ($query) => $query->where('gpa', '<=', (float) $gpaMax))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return view('students.index', compact('students', 'q', 'stage', 'country', 'gpaMin', 'gpaMax'));
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $this->authUser($request);
        $data = $request->validate([
            'full_name' => 'required|string|max:120',
            'email' => 'required|email|max:120|unique:students,email',
            'account_password' => 'required|string|min:8|max:120',
            'phone' => 'nullable|string|max:30',
            'nationality' => 'nullable|string|max:60',
            'gpa' => 'nullable|numeric|min:0|max:4',
            'field_of_study' => 'nullable|string|max:150',
            'english_level' => 'nullable|string|max:80',
            'stage' => 'required|string|max:40',
            'target_country' => 'nullable|string|max:60',
            'budget_usd' => 'nullable|numeric|min:0',
            'passport_number' => 'nullable|string|max:40',
            'is_active' => 'nullable|boolean',
        ]);
        $existingPortalUser = User::query()->where('email', $data['email'])->whereNull('deleted_at')->first();
        if ($existingPortalUser) {
            return back()->withErrors(['email' => 'Email is already used by another account.'])->withInput();
        }
        $studentUser = User::query()->create([
            'tenant_id' => $user->tenant_id,
            'name' => $data['full_name'],
            'email' => $data['email'],
            'password' => Hash::make((string) $data['account_password']),
            'role_slug' => 'student',
            'language' => 'en',
            'is_active' => (int) ($data['is_active'] ?? 1),
        ]);

        unset($data['account_password']);
        $data['tenant_id'] = $user->tenant_id;
        if (Schema::hasColumn('students', 'user_id')) {
            $data['user_id'] = $studentUser->id;
        }
        $data['stage_temperature'] = match ($data['stage']) {
            'enrolled', 'accepted' => 'hot',
            'applied', 'interested' => 'warm',
            default => 'cold',
        };
        $data['is_active'] = (int) ($data['is_active'] ?? 1);

        $student = Student::query()->create($data);
        $this->audit($request, 'student.create', 'student', $student->id, $data);

        return back()->with('success', 'Student created.');
    }

    public function show(Request $request, int $id): View
    {
        $user = $this->authUser($request);
        $student = Student::query()->forTenant($user->tenant_id, $user->role_slug)->whereNull('deleted_at')->findOrFail($id);

        $apps = Application::query()->forTenant($user->tenant_id, $user->role_slug)->where('student_id', $student->id)->get();
        $docs = Document::query()->forTenant($user->tenant_id, $user->role_slug)->where('student_id', $student->id)->get();
        $tasks = Task::query()->forTenant($user->tenant_id, $user->role_slug)->where('student_id', $student->id)->get();

        return view('students.show', compact('student', 'apps', 'docs', 'tasks'));
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $user = $this->authUser($request);
        $student = Student::query()->forTenant($user->tenant_id, $user->role_slug)->whereNull('deleted_at')->findOrFail($id);
        $data = $request->validate([
            'full_name' => 'required|string|max:120',
            'email' => 'required|email|max:120|unique:students,email,'.$student->id,
            'account_password' => 'nullable|string|min:8|max:120',
            'phone' => 'nullable|string|max:30',
            'nationality' => 'nullable|string|max:60',
            'gpa' => 'nullable|numeric|min:0|max:4',
            'field_of_study' => 'nullable|string|max:150',
            'english_level' => 'nullable|string|max:80',
            'stage' => 'required|string|max:40',
            'target_country' => 'nullable|string|max:60',
            'budget_usd' => 'nullable|numeric|min:0',
            'passport_number' => 'nullable|string|max:40',
            'is_active' => 'nullable|boolean',
        ]);
        $conflict = User::query()
            ->where('email', $data['email'])
            ->whereNull('deleted_at')
            ->when($student->user_id, fn ($query) => $query->where('id', '!=', $student->user_id))
            ->exists();
        if ($conflict) {
            return back()->withErrors(['email' => 'Email is already used by another account.'])->withInput();
        }
        $studentUser = null;
        if ($student->user_id) {
            $studentUser = User::query()
                ->where('id', $student->user_id)
                ->where('role_slug', 'student')
                ->first();
        }
        if (!$studentUser) {
            $studentUser = User::query()->create([
                'tenant_id' => $user->tenant_id,
                'name' => $data['full_name'],
                'email' => $data['email'],
                'password' => Hash::make((string) ($data['account_password'] ?: bin2hex(random_bytes(8)))),
                'role_slug' => 'student',
                'language' => 'en',
                'is_active' => (int) ($data['is_active'] ?? $student->is_active ?? 1),
            ]);
            if (Schema::hasColumn('students', 'user_id')) {
                $data['user_id'] = $studentUser->id;
            }
        }

        $userUpdate = [
            'name' => $data['full_name'],
            'email' => $data['email'],
            'is_active' => (int) ($data['is_active'] ?? $student->is_active ?? 1),
        ];
        if (!empty($data['account_password'])) {
            $userUpdate['password'] = Hash::make((string) $data['account_password']);
        }
        $studentUser->update($userUpdate);
        unset($data['account_password']);
        $data['is_active'] = (int) ($data['is_active'] ?? $student->is_active ?? 1);
        $student->update($data);
        $this->audit($request, 'student.update', 'student', $student->id, $data);

        return back()->with('success', 'Student updated.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $user = $this->authUser($request);
        $student = Student::query()->forTenant($user->tenant_id, $user->role_slug)->whereNull('deleted_at')->findOrFail($id);
        $student->update(['deleted_at' => now()]);
        if ($student->user_id) {
            User::query()->where('id', $student->user_id)->update([
                'is_active' => 0,
                'deleted_at' => now(),
            ]);
        }
        $this->audit($request, 'student.delete', 'student', $student->id);

        return back()->with('success', 'Student deleted.');
    }

    public function resetPassword(Request $request, int $id): RedirectResponse
    {
        $user = $this->authUser($request);
        $student = Student::query()->forTenant($user->tenant_id, $user->role_slug)->whereNull('deleted_at')->findOrFail($id);

        $data = $request->validate([
            'new_password' => 'required|string|min:8|max:120',
        ]);

        $studentUser = null;
        if ($student->user_id) {
            $studentUser = User::query()->where('id', $student->user_id)->where('role_slug', 'student')->first();
        }
        if (!$studentUser) {
            $studentUser = User::query()->where('email', $student->email)->where('role_slug', 'student')->first();
        }
        if (!$studentUser) {
            return back()->withErrors(['new_password' => 'Student login account not found.']);
        }

        $studentUser->update(['password' => Hash::make((string) $data['new_password'])]);
        $this->audit($request, 'student.reset_password', 'student', $student->id);

        return back()->with('success', 'Student password reset successfully.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Student;
use App\Models\University;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ApplicationController extends Controller
{
    public function index(Request $request): View
    {
        $user = $this->authUser($request);
        $status = (string) $request->query('status', '');
        $q = (string) $request->query('q', '');

        $applications = Application::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->leftJoin('students', 'students.id', '=', 'applications.student_id')
            ->leftJoin('universities', 'universities.id', '=', 'applications.university_id')
            ->select([
                'applications.*',
                DB::raw('students.full_name as student_name'),
                DB::raw('universities.name as university_name'),
            ])
            ->when($q !== '', fn ($query) => $query->where(function ($sub) use ($q) {
                $sub->where('students.full_name', 'like', "%{$q}%")
                    ->orWhere('applications.program', 'like', "%{$q}%")
                    ->orWhere('universities.name', 'like', "%{$q}%")
                    ->orWhere('applications.notes', 'like', "%{$q}%");
            }))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $students = Student::query()->forTenant($user->tenant_id, $user->role_slug)->whereNull('deleted_at')->orderBy('full_name')->get();
        $universities = University::query()->forTenant($user->tenant_id, $user->role_slug)->orderBy('name')->get();

        return view('applications.index', compact('applications', 'students', 'universities', 'status', 'q'));
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $this->authUser($request);
        $data = $request->validate([
            'student_id' => 'required|integer',
            'university_id' => 'required|integer',
            'program' => 'required|string|max:160',
            'intake' => 'required|string|max:80',
            'status' => 'required|string|max:80',
            'deadline' => 'nullable|date',
            'notes' => 'nullable|string|max:5000',
        ]);
        $data['tenant_id'] = $user->tenant_id;
        $data['last_activity_at'] = now();
        [$data['enroll_probability'], $data['explainability'], $data['best_next_action']] = $this->score($data);

        $application = Application::query()->create($data);
        $this->audit($request, 'application.create', 'application', $application->id, $data);

        return back()->with('success', 'Application created.');
    }

    public function show(Request $request, int $id): View
    {
        $user = $this->authUser($request);
        $application = Application::query()->forTenant($user->tenant_id, $user->role_slug)->findOrFail($id);
        $student = Student::query()->forTenant($user->tenant_id, $user->role_slug)->find($application->student_id);
        $university = University::query()->forTenant($user->tenant_id, $user->role_slug)->find($application->university_id);
        $students = Student::query()->forTenant($user->tenant_id, $user->role_slug)->whereNull('deleted_at')->orderBy('full_name')->get();
        $universities = University::query()->forTenant($user->tenant_id, $user->role_slug)->orderBy('name')->get();
        return view('applications.show', compact('application', 'student', 'university', 'students', 'universities'));
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $user = $this->authUser($request);
        $application = Application::query()->forTenant($user->tenant_id, $user->role_slug)->findOrFail($id);
        $data = $request->validate([
            'student_id' => 'required|integer',
            'university_id' => 'required|integer',
            'program' => 'required|string|max:160',
            'intake' => 'required|string|max:80',
            'status' => 'required|string|max:80',
            'deadline' => 'nullable|date',
            'notes' => 'nullable|string|max:5000',
        ]);
        [$data['enroll_probability'], $data['explainability'], $data['best_next_action']] = $this->score($data);
        $data['last_activity_at'] = now();
        $application->update($data);
        $this->audit($request, 'application.update', 'application', $application->id, $data);

        return back()->with('success', 'Application updated.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $user = $this->authUser($request);
        $application = Application::query()->forTenant($user->tenant_id, $user->role_slug)->findOrFail($id);
        $application->delete();
        $this->audit($request, 'application.delete', 'application', $id);

        return back()->with('success', 'Application deleted.');
    }

    private function score(array $data): array
    {
        $score = 50;
        $reason = ['Base score = 50'];

        if (in_array($data['status'], ['submitted', 'under_review'], true)) {
            $score += 10;
            $reason[] = 'Application active in pipeline (+10)';
        }
        if (in_array($data['status'], ['accepted', 'enrolled'], true)) {
            $score += 25;
            $reason[] = 'Offer/Enroll stage (+25)';
        }
        if (!empty($data['deadline'])) {
            $days = now()->diffInDays($data['deadline'], false);
            if ($days < 0) {
                $score -= 20;
                $reason[] = 'Deadline passed (-20)';
            }
            if ($days >= 0 && $days <= 7) {
                $score += 5;
                $reason[] = 'Near-term deadline keeps momentum (+5)';
            }
        }

        $score = max(0, min(99, $score));
        $nextAction = $score < 55 ? 'Follow up with student and collect missing docs' : 'Push university communication and fee confirmation';

        return [$score, implode(' | ', $reason), $nextAction];
    }
}

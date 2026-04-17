<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Document;
use App\Models\Notification;
use App\Models\StudentMessage;
use App\Models\Student;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\View\View;

class PortalWebController extends Controller
{
    public function showLogin(): View
    {
        return view('portal.login');
    }

    public function login(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
        $user = User::query()
            ->where('email', $data['email'])
            ->where('role_slug', 'student')
            ->whereNull('deleted_at')
            ->first();
        if (!$user || !$user->is_active || !Hash::check($data['password'], $user->password)) {
            return back()->withErrors(['email' => 'Invalid credentials']);
        }
        Auth::guard('crm')->logout();
        Auth::guard('student')->login($user, false);
        $request->session()->regenerate();

        return redirect('/portal/dashboard');
    }

    public function dashboard(Request $request): View
    {
        $user = $this->authUser($request);
        $student = $this->studentForUser($user);
        $applications = Application::query()->where('tenant_id', $user->tenant_id)->where('student_id', $student->id)->get();
        $documents = Document::query()->where('tenant_id', $user->tenant_id)->where('student_id', $student->id)->get();
        $messages = collect();
        if (Schema::hasTable('student_messages')) {
            $messages = StudentMessage::query()->where('tenant_id', $user->tenant_id)->where('student_user_id', $user->id)->latest('id')->limit(5)->get();
        }

        return view('portal.dashboard', compact('student', 'applications', 'documents', 'messages'));
    }

    public function universities(Request $request): View
    {
        $user = $this->authUser($request);
        $universities = University::query()->where('tenant_id', $user->tenant_id)->where('is_active', 1)->get();
        return view('portal.universities', compact('universities'));
    }

    public function applications(Request $request): View
    {
        $user = $this->authUser($request);
        $student = $this->studentForUser($user);
        $applications = Application::query()->where('tenant_id', $user->tenant_id)->where('student_id', $student->id)->get();
        return view('portal.applications', compact('applications'));
    }

    public function documents(Request $request): View
    {
        $user = $this->authUser($request);
        $student = $this->studentForUser($user);
        $documents = Document::query()->where('tenant_id', $user->tenant_id)->where('student_id', $student->id)->get();
        return view('portal.documents', compact('documents'));
    }

    public function uploadDocument(Request $request): RedirectResponse
    {
        $user = $this->authUser($request);
        $student = $this->studentForUser($user);
        $data = $request->validate([
            'type' => 'required|string|in:passport,diploma,transcript,english_certificate,photo',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);
        $path = $request->file('file')->store('docs', 'public');
        Document::query()->create([
            'tenant_id' => $user->tenant_id,
            'student_id' => $student->id,
            'type' => $data['type'],
            'file_url' => '/storage/'.$path,
            'file_name' => basename($path),
            'status' => 'uploaded',
        ]);

        return back()->with('success', 'Document uploaded');
    }

    public function messages(Request $request): View
    {
        $user = $this->authUser($request);
        if (!Schema::hasTable('student_messages')) {
            return back()->withErrors(['message' => 'Messaging module is not migrated yet.']);
        }
        $messages = StudentMessage::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('student_user_id', $user->id)
            ->latest('id')
            ->paginate(20);

        return view('portal.messages', compact('messages'));
    }

    public function sendMessage(Request $request): RedirectResponse
    {
        $user = $this->authUser($request);
        if (!Schema::hasTable('student_messages')) {
            return back()->withErrors(['message' => 'Messaging module is not migrated yet.']);
        }
        $student = $this->studentForUser($user);
        $data = $request->validate([
            'message' => 'required|string|min:3|max:4000',
        ]);

        $recipient = User::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereIn('role_slug', ['admin', 'agent', 'super_admin'])
            ->where('is_active', 1)
            ->orderByRaw("FIELD(role_slug, 'agent', 'admin', 'super_admin')")
            ->first();

        $row = StudentMessage::query()->create([
            'tenant_id' => $user->tenant_id,
            'student_id' => $student->id,
            'student_user_id' => $user->id,
            'recipient_user_id' => $recipient?->id,
            'sender_role' => 'student',
            'body' => $data['message'],
        ]);

        if ($recipient) {
            Notification::query()->create([
                'tenant_id' => $user->tenant_id,
                'user_id' => $recipient->id,
                'type' => 'student_message',
                'title' => 'New message from student',
                'body' => $student->full_name.': '.$data['message'],
                'meta_json' => json_encode(['message_id' => $row->id, 'student_id' => $student->id]),
            ]);
        }

        return back()->with('success', 'Message sent.');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('student')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/portal/login');
    }

    private function studentForUser(User $user): Student
    {
        $query = Student::query()->where('tenant_id', $user->tenant_id);
        if (Schema::hasColumn('students', 'user_id')) {
            $query->where(function ($sub) use ($user) {
                $sub->where('user_id', $user->id)->orWhere('email', $user->email);
            });
        } else {
            $query->where('email', $user->email);
        }

        return $query->firstOrFail();
    }
}

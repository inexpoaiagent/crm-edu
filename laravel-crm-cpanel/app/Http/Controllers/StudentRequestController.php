<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Student;
use App\Models\StudentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class StudentRequestController extends Controller
{
    public function index(Request $request): View
    {
        $user = $this->authUser($request);
        $status = (string) $request->query('status', 'pending');
        $pendingCount = StudentRequest::query()->forTenant($user->tenant_id, $user->role_slug)->where('status', 'pending')->count();
        $processedCount = StudentRequest::query()->forTenant($user->tenant_id, $user->role_slug)->whereIn('status', ['approved', 'rejected'])->count();
        $requests = StudentRequest::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->when($status === 'processed', fn ($q) => $q->whereIn('status', ['approved', 'rejected']), fn ($q) => $q->where('status', 'pending'))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return view('requests.index', compact('requests', 'status', 'pendingCount', 'processedCount'));
    }

    public function show(Request $request, int $id): View
    {
        $user = $this->authUser($request);
        $requestItem = StudentRequest::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->findOrFail($id);

        return view('requests.show', compact('requestItem'));
    }

    public function approve(Request $request, int $id): RedirectResponse
    {
        $user = $this->authUser($request);
        $requestItem = StudentRequest::query()->forTenant($user->tenant_id, $user->role_slug)->where('status', 'pending')->findOrFail($id);

        $student = Student::query()->create([
            'tenant_id' => $user->tenant_id,
            'full_name' => $requestItem->full_name,
            'email' => $requestItem->email,
            'phone' => $requestItem->phone,
            'nationality' => $requestItem->nationality,
            'field_of_study' => $requestItem->target_program,
            'stage' => 'lead',
            'stage_temperature' => 'warm',
            'is_active' => 1,
        ]);

        Application::query()->create([
            'tenant_id' => $user->tenant_id,
            'student_id' => $student->id,
            'university_id' => 1,
            'program' => $requestItem->target_program ?: 'General Admission',
            'intake' => date('Y').'-Fall',
            'status' => 'draft',
            'notes' => 'Auto-created from student request approval.',
            'enroll_probability' => 40,
            'best_next_action' => 'Collect all required documents',
            'explainability' => 'Initial request approved and case opened.',
            'last_activity_at' => now(),
        ]);

        $requestItem->update([
            'status' => 'approved',
            'processed_by' => $user->id,
            'processed_at' => now(),
            'review_note' => (string) $request->input('note', 'Approved from CRM queue.'),
        ]);
        $this->audit($request, 'student_request.approve', 'student_request', $requestItem->id);

        return back()->with('success', 'Request approved and student profile created.');
    }

    public function reject(Request $request, int $id): RedirectResponse
    {
        $user = $this->authUser($request);
        $requestItem = StudentRequest::query()->forTenant($user->tenant_id, $user->role_slug)->where('status', 'pending')->findOrFail($id);
        $requestItem->update([
            'status' => 'rejected',
            'processed_by' => $user->id,
            'processed_at' => now(),
            'review_note' => (string) $request->input('note', 'Rejected by admin review.'),
        ]);
        $this->audit($request, 'student_request.reject', 'student_request', $requestItem->id);

        return back()->with('success', 'Request rejected.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PipelineController extends Controller
{
    public function index(Request $request): View
    {
        $user = $this->authUser($request);
        $students = Student::query()->forTenant($user->tenant_id, $user->role_slug)->whereNull('deleted_at')->get();

        return view('pipeline.index', [
            'columns' => [
                'lead' => $students->where('stage', 'lead')->values(),
                'applied' => $students->where('stage', 'applied')->values(),
                'offered' => $students->where('stage', 'offered')->values(),
                'enrolled' => $students->whereIn('stage', ['accepted', 'enrolled'])->values(),
            ],
        ]);
    }

    public function move(Request $request): JsonResponse
    {
        $user = $this->authUser($request);
        $data = $request->validate([
            'student_id' => 'required|integer',
            'stage' => 'required|in:lead,applied,offered,enrolled',
        ]);

        $student = Student::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->whereNull('deleted_at')
            ->findOrFail((int) $data['student_id']);

        $stage = $data['stage'] === 'enrolled' ? 'enrolled' : $data['stage'];
        $student->update([
            'stage' => $stage,
            'stage_temperature' => match ($stage) {
                'enrolled' => 'hot',
                'offered', 'applied' => 'warm',
                default => 'cold',
            },
        ]);
        $this->audit($request, 'student.move_stage', 'student', $student->id, ['stage' => $stage]);

        return response()->json(['ok' => true]);
    }
}

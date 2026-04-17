<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Notification;
use App\Models\Student;
use App\Models\StudentRequest;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): View
    {
        $user = $this->authUser($request);

        $students = Student::query()->forTenant($user->tenant_id, $user->role_slug)->whereNull('deleted_at');
        $applications = Application::query()->forTenant($user->tenant_id, $user->role_slug);
        $tasks = Task::query()->forTenant($user->tenant_id, $user->role_slug);
        $requests = StudentRequest::query()->forTenant($user->tenant_id, $user->role_slug)->where('status', 'pending');

        $pipeline = [
            'lead' => (clone $students)->where('stage', 'lead')->count(),
            'applied' => (clone $students)->where('stage', 'applied')->count(),
            'enrolled' => (clone $students)->where('stage', 'enrolled')->count(),
        ];

        $recentStudents = (clone $students)->latest('id')->limit(5)->get();
        $notifications = Notification::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->where('user_id', $user->id)
            ->latest('id')
            ->limit(5)
            ->get();
        $unreadNotifications = $notifications->whereNull('read_at')->count();
        $topPrograms = Application::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->select('program', DB::raw('count(*) as total'))
            ->groupBy('program')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return view('dashboard.index', [
            'user' => $user,
            'stats' => [
                'students' => (clone $students)->count(),
                'active_applications' => (clone $applications)->whereIn('status', ['submitted', 'under_review', 'accepted'])->count(),
                'pending_tasks' => (clone $tasks)->whereIn('status', ['todo', 'in_progress'])->count(),
                'new_requests' => $requests->count(),
            ],
            'pipeline' => $pipeline,
            'recentStudents' => $recentStudents,
            'unreadNotifications' => $unreadNotifications,
            'notifications' => $notifications,
            'topPrograms' => $topPrograms,
        ]);
    }
}

<?php

use App\Models\Application;
use App\Models\Notification;
use App\Models\Task;
use Illuminate\Support\Facades\Artisan;

Artisan::command('crm:sla-check', function (): void {
    $lateTasks = Task::query()->whereIn('status', ['todo', 'in_progress'])->whereDate('deadline', '<', now())->get();
    foreach ($lateTasks as $task) {
        $task->update(['escalation_level' => min((int) $task->escalation_level + 1, 3)]);
        Notification::query()->create([
            'tenant_id' => $task->tenant_id,
            'user_id' => $task->assigned_to,
            'type' => 'sla_escalation',
            'title' => 'Overdue task escalated',
            'body' => "Task #{$task->id} is overdue and escalated.",
            'meta_json' => json_encode(['task_id' => $task->id]),
        ]);
    }

    $staleApps = Application::query()
        ->whereDate('last_activity_at', '<', now()->subDays(7))
        ->whereNotIn('status', ['accepted', 'rejected', 'enrolled'])
        ->get();

    foreach ($staleApps as $application) {
        Task::query()->create([
            'tenant_id' => $application->tenant_id,
            'student_id' => $application->student_id,
            'assigned_to' => 1,
            'title' => 'Follow up stale application',
            'description' => 'Application has been inactive for 7+ days.',
            'priority' => 'high',
            'status' => 'todo',
            'deadline' => now()->addDays(1),
            'escalation_level' => 1,
        ]);
    }
})->purpose('Checks SLA breaches and creates escalations for overdue workflows.');

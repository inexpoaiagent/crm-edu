@extends('layouts.app')

@php
    $tab = request()->query('tab', 'overview');
@endphp

@section('content')
<div class="card">
    <h2 style="margin-top:0;">{{ $student->full_name }}</h2>
    <div class="tabs">
        <a class="tab {{ $tab === 'overview' ? 'active' : '' }}" href="/students/{{ $student->id }}?tab=overview">Overview</a>
        <a class="tab {{ $tab === 'apps' ? 'active' : '' }}" href="/students/{{ $student->id }}?tab=apps">Apps ({{ $apps->count() }})</a>
        <a class="tab {{ $tab === 'docs' ? 'active' : '' }}" href="/students/{{ $student->id }}?tab=docs">Docs ({{ $docs->count() }})</a>
        <a class="tab {{ $tab === 'tasks' ? 'active' : '' }}" href="/students/{{ $student->id }}?tab=tasks">Tasks ({{ $tasks->count() }})</a>
        <a class="tab {{ $tab === 'timeline' ? 'active' : '' }}" href="/students/{{ $student->id }}?tab=timeline">Timeline</a>
    </div>

    @if($tab === 'overview')
    <div class="two-col">
        <div class="card">
            <h3>Academic Profile</h3>
            <p><strong>Email:</strong> {{ $student->email }}</p>
            <p><strong>Phone:</strong> {{ $student->phone ?: '-' }}</p>
            <p><strong>GPA:</strong> {{ $student->gpa ?: '-' }}</p>
            <p><strong>English Level:</strong> {{ $student->english_level ?: '-' }}</p>
            <p><strong>Field of Study:</strong> {{ $student->field_of_study ?: '-' }}</p>
            <p><strong>Target Country:</strong> {{ $student->target_country ?: '-' }}</p>
            <p><strong>Budget (USD):</strong> {{ $student->budget_usd ?: '-' }}</p>
            <p><strong>Passport #:</strong> {{ $student->passport_number ?: '-' }}</p>
        </div>
        <div class="card">
            <h3>Case Health</h3>
            <p><strong>Current Stage:</strong> <span class="badge {{ $student->stage }}">{{ ucfirst($student->stage) }}</span></p>
            <p><strong>Temperature:</strong> <span class="{{ $student->stage_temperature }}">{{ ucfirst($student->stage_temperature ?: 'cold') }}</span></p>
            <p><strong>Applications:</strong> {{ $apps->count() }}</p>
            <p><strong>Documents:</strong> {{ $docs->count() }}</p>
            <p><strong>Open Tasks:</strong> {{ $tasks->whereIn('status', ['todo', 'in_progress'])->count() }}</p>
        </div>
    </div>
    @elseif($tab === 'apps')
    <table class="table-compact">
        <thead><tr><th>ID</th><th>Program</th><th>Status</th><th>Intake</th><th>Action</th></tr></thead>
        <tbody>
            @forelse($apps as $app)
                <tr>
                    <td>#{{ $app->id }}</td>
                    <td>{{ $app->program }}</td>
                    <td><span class="badge {{ $app->status }}">{{ ucfirst($app->status) }}</span></td>
                    <td>{{ $app->intake }}</td>
                    <td><a class="tab" href="/applications/{{ $app->id }}">Open</a></td>
                </tr>
            @empty
                <tr><td colspan="5">No applications for this student yet.</td></tr>
            @endforelse
        </tbody>
    </table>
    @elseif($tab === 'docs')
    <table class="table-compact">
        <thead><tr><th>Type</th><th>Status</th><th>File</th><th>Expiry</th></tr></thead>
        <tbody>
            @forelse($docs as $doc)
                <tr>
                    <td>{{ $doc->type }}</td>
                    <td>{{ ucfirst($doc->status) }}</td>
                    <td>{{ $doc->file_name ?: '-' }}</td>
                    <td>{{ $doc->expiry_date ?: '-' }}</td>
                </tr>
            @empty
                <tr><td colspan="4">No documents found.</td></tr>
            @endforelse
        </tbody>
    </table>
    @elseif($tab === 'tasks')
    <table class="table-compact">
        <thead><tr><th>Title</th><th>Priority</th><th>Status</th><th>Deadline</th></tr></thead>
        <tbody>
            @forelse($tasks as $task)
                <tr>
                    <td>{{ $task->title }}</td>
                    <td>{{ ucfirst($task->priority) }}</td>
                    <td>{{ ucfirst($task->status) }}</td>
                    <td>{{ $task->deadline ?: '-' }}</td>
                </tr>
            @empty
                <tr><td colspan="4">No tasks assigned.</td></tr>
            @endforelse
        </tbody>
    </table>
    @else
    <div class="card">
        <h3>Timeline</h3>
        <p class="footer-note">Student profile created at {{ $student->created_at }}.</p>
        <p class="footer-note">Last update at {{ $student->updated_at }}.</p>
    </div>
    @endif
</div>
@endsection

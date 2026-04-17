@extends('layouts.app')

@section('content')
<div class="card">
    <div class="toolbar">
        <form method="GET" action="/applications" class="toolbar grow">
            <input id="global-search" name="q" value="{{ $q }}" placeholder="Search student/program/university/notes">
            <select name="status">
                <option value="">All statuses</option>
                @foreach(['draft','submitted','under_review','accepted','rejected','enrolled'] as $s)
                    <option value="{{ $s }}" {{ $status === $s ? 'selected' : '' }}>{{ ucfirst($s) }}</option>
                @endforeach
            </select>
            <button type="submit">Filter</button>
        </form>
        <button onclick="document.getElementById('addApp').showModal()">+ Add Application</button>
    </div>
    <table class="table-compact">
        <thead><tr><th>ID</th><th>Student</th><th>University</th><th>Program</th><th>Status</th><th>Enroll %</th><th>Next Action</th><th>Actions</th></tr></thead>
        <tbody>
        @foreach($applications as $app)
            <tr>
                <td><a href="/applications/{{ $app->id }}">#{{ $app->id }}</a></td>
                <td>{{ $app->student_name ?: ('#'.$app->student_id) }}</td>
                <td>{{ $app->university_name ?: ('#'.$app->university_id) }}</td>
                <td>{{ $app->program }}</td>
                <td><span class="badge {{ $app->status }}">{{ ucfirst($app->status) }}</span></td>
                <td>{{ $app->enroll_probability }}%</td>
                <td>{{ $app->best_next_action ?: '-' }}</td>
                <td style="display:flex;gap:6px;">
                    <a class="tab" href="/applications/{{ $app->id }}">View</a>
                    <form method="POST" action="/applications/{{ $app->id }}" onsubmit="return confirm('Delete application?')">@csrf @method('DELETE')<button class="secondary">Delete</button></form>
                </td>
            </tr>
        @endforeach
        </tbody>
    </table>
    <div style="margin-top:10px;">{{ $applications->links() }}</div>
</div>

<dialog id="addApp" class="card" style="max-width:820px;">
    <h3 style="margin-top:0;">Add Application</h3>
    <form method="POST" action="/applications">
        @csrf
        <div class="grid-4">
            <select name="student_id" required>
                @foreach($students as $s)
                    <option value="{{ $s->id }}">{{ $s->full_name }}</option>
                @endforeach
            </select>
            <select name="university_id" required>
                @foreach($universities as $u)
                    <option value="{{ $u->id }}">{{ $u->name }}</option>
                @endforeach
            </select>
            <input name="program" placeholder="Program" required>
            <input name="intake" placeholder="Intake (e.g., 2026-Fall)" required>
            <select name="status"><option>draft</option><option>submitted</option><option>under_review</option><option>accepted</option><option>rejected</option><option>enrolled</option></select>
            <input name="deadline" type="date">
        </div>
        <textarea name="notes" rows="4" style="width:100%;margin-top:8px;" placeholder="Notes"></textarea>
        <div style="margin-top:10px;"><button>Save</button></div>
    </form>
</dialog>
@endsection

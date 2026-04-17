@extends('layouts.app')

@section('content')
<div class="hero monitor-hero">
    <h2>Control Center</h2>
    <div class="footer-note" style="color:#dbeafe;">Track requests, pipeline and critical actions in one screen.</div>
</div>

<div class="grid-4">
    <div class="card"><h3>Total Students</h3><div class="metric">{{ $stats['students'] }}</div></div>
    <div class="card"><h3>Active Applications</h3><div class="metric">{{ $stats['active_applications'] }}</div></div>
    <div class="card"><h3>Pending Tasks</h3><div class="metric">{{ $stats['pending_tasks'] }}</div></div>
    <div class="card"><h3>Unread Alerts</h3><div class="metric">{{ $unreadNotifications }}</div></div>
</div>

<div class="three-col" style="margin-top:12px;">
    <div class="card">
        <h3>Pipeline Snapshot</h3>
        <div class="stat-row"><span>Lead</span><strong>{{ $pipeline['lead'] }}</strong></div>
        <div class="stat-row"><span>Applied</span><strong>{{ $pipeline['applied'] }}</strong></div>
        <div class="stat-row"><span>Enrolled</span><strong>{{ $pipeline['enrolled'] }}</strong></div>
        <div style="margin-top:10px;"><a class="tab" href="/pipeline">Open Pipeline Board</a></div>
    </div>

    <div class="card">
        <h3>Top Programs</h3>
        @forelse($topPrograms as $program)
            <div class="stat-row"><span>{{ $program->program }}</span><strong>{{ $program->total }}</strong></div>
        @empty
            <p class="footer-note">No program data yet.</p>
        @endforelse
    </div>

    <div class="card">
        <h3>Quick Actions</h3>
        <p><a href="/student-requests">Review Student Requests</a></p>
        <p><a href="/students">Students Registry</a></p>
        <p><a href="/applications">Applications Desk</a></p>
        <p><a href="/scholarships">Scholarships</a></p>
    </div>
</div>

<div class="two-col" style="margin-top:12px;">
    <div class="card">
        <h3>Recent Students</h3>
        <table class="table-compact">
            <thead>
            <tr>
                <th>Name</th><th>Nationality</th><th>Stage</th><th>Heat</th><th>Action</th>
            </tr>
            </thead>
            <tbody>
            @foreach($recentStudents as $student)
                <tr>
                    <td>{{ $student->full_name }}</td>
                    <td>{{ $student->nationality ?: '-' }}</td>
                    <td><span class="badge {{ $student->stage }}">{{ ucfirst($student->stage) }}</span></td>
                    <td class="{{ $student->stage_temperature }}">{{ ucfirst($student->stage_temperature ?: 'cold') }}</td>
                    <td><a href="/students/{{ $student->id }}">More info</a></td>
                </tr>
            @endforeach
            </tbody>
        </table>
    </div>

    <div class="card">
        <h3>Latest Notifications</h3>
        @forelse($notifications as $n)
            <div class="notif-item {{ $n->read_at ? '' : 'unread' }}">
                <strong>{{ $n->title }}</strong>
                <div class="footer-note">{{ $n->body }}</div>
            </div>
        @empty
            <p class="footer-note">No notifications.</p>
        @endforelse
        <div style="margin-top:10px;">
            <a class="tab" href="/notifications">Open Notification Center</a>
        </div>
    </div>
</div>
@endsection

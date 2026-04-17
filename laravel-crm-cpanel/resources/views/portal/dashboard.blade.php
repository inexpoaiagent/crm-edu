@extends('layouts.portal')

@section('content')
<div class="card">
    <h2 style="margin-top:0;">Welcome, {{ $student->full_name }}</h2>
    <p><strong>Email:</strong> {{ $student->email }}</p>
    <p><strong>Current Stage:</strong> <span class="badge {{ $student->stage }}">{{ ucfirst($student->stage) }}</span></p>
    <div class="tabs">
        <a class="tab" href="/portal/universities">Universities</a>
        <a class="tab" href="/portal/applications">Applications</a>
        <a class="tab" href="/portal/documents">Documents</a>
        <a class="tab" href="/portal/messages">Messages</a>
    </div>
    <div class="grid-4">
        <div class="card"><h3>Applications</h3><div class="metric">{{ $applications->count() }}</div></div>
        <div class="card"><h3>Documents</h3><div class="metric">{{ $documents->count() }}</div></div>
        <div class="card"><h3>Messages</h3><div class="metric">{{ $messages->count() }}</div></div>
        <div class="card"><h3>Profile Status</h3><div class="metric">{{ (int) $student->is_active === 1 ? 'Active' : 'Inactive' }}</div></div>
    </div>
</div>
@endsection

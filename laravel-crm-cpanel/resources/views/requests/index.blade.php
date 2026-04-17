@extends('layouts.app')

@section('content')
<div class="card">
    <h2 style="margin-top:0;">Student Requests</h2>
    <p class="footer-note">Incoming applications from the student portal.</p>
    <div class="tabs">
        <a class="tab {{ $status === 'pending' ? 'active' : '' }}" href="/student-requests?status=pending">Pending ({{ $pendingCount }})</a>
        <a class="tab {{ $status === 'processed' ? 'active' : '' }}" href="/student-requests?status=processed">Processed ({{ $processedCount }})</a>
    </div>
    <table class="table-compact">
        <thead><tr><th>Name</th><th>Email</th><th>Target Program</th><th>Nationality</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
        @foreach($requests as $requestItem)
            <tr>
                <td>{{ $requestItem->full_name }}</td>
                <td>{{ $requestItem->email }}</td>
                <td>{{ $requestItem->target_program ?: '-' }}</td>
                <td>{{ $requestItem->nationality }}</td>
                <td>{{ ucfirst($requestItem->status) }}</td>
                <td style="display:flex;gap:6px;">
                    @if($requestItem->status === 'pending')
                        <form method="POST" action="/student-requests/{{ $requestItem->id }}/approve">@csrf<button>Approve</button></form>
                        <form method="POST" action="/student-requests/{{ $requestItem->id }}/reject">@csrf<button class="secondary">Reject</button></form>
                    @endif
                    <a class="secondary tab" href="/student-requests/{{ $requestItem->id }}">More info</a>
                </td>
            </tr>
        @endforeach
        </tbody>
    </table>
    <div style="margin-top:10px;">{{ $requests->links() }}</div>
</div>
@endsection

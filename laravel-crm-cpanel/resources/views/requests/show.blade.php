@extends('layouts.app')

@section('content')
<div class="card">
    <h2 style="margin-top:0;">Student Request #{{ $requestItem->id }}</h2>
    <div class="two-col">
        <div class="card">
            <h3>Applicant</h3>
            <p><strong>Name:</strong> {{ $requestItem->full_name }}</p>
            <p><strong>Email:</strong> {{ $requestItem->email }}</p>
            <p><strong>Phone:</strong> {{ $requestItem->phone ?: '-' }}</p>
            <p><strong>Nationality:</strong> {{ $requestItem->nationality ?: '-' }}</p>
            <p><strong>Target Program:</strong> {{ $requestItem->target_program ?: '-' }}</p>
        </div>
        <div class="card">
            <h3>Review Status</h3>
            <p><strong>Status:</strong> <span class="badge {{ $requestItem->status }}">{{ ucfirst($requestItem->status) }}</span></p>
            <p><strong>Processed At:</strong> {{ $requestItem->processed_at ?: '-' }}</p>
            <p><strong>Review Note:</strong> {{ $requestItem->review_note ?: '-' }}</p>
            @if($requestItem->status === 'pending')
                <div style="display:flex;gap:8px;margin-top:10px;">
                    <form method="POST" action="/student-requests/{{ $requestItem->id }}/approve">@csrf<button>Approve</button></form>
                    <form method="POST" action="/student-requests/{{ $requestItem->id }}/reject">@csrf<button class="secondary">Reject</button></form>
                </div>
            @endif
        </div>
    </div>
    <div style="margin-top:10px;">
        <a class="tab" href="/student-requests">Back to requests</a>
    </div>
</div>
@endsection

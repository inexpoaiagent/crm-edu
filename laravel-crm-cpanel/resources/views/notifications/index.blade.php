@extends('layouts.app')

@section('content')
<div class="card">
    <div class="toolbar">
        <h2 style="margin:0;">Notification Center</h2>
        <form method="POST" action="/notifications/read-all">
            @csrf
            <button class="secondary" type="submit">Mark all as read</button>
        </form>
    </div>
    @forelse($notifications as $n)
        <div class="notif-item {{ $n->read_at ? '' : 'unread' }}">
            <div style="display:flex;justify-content:space-between;gap:8px;">
                <strong>{{ $n->title }}</strong>
                <span class="footer-note">{{ $n->created_at }}</span>
            </div>
            <div>{{ $n->body }}</div>
            @if(!$n->read_at)
                <form method="POST" action="/notifications/{{ $n->id }}/read" style="margin-top:8px;">
                    @csrf
                    <button class="secondary">Mark read</button>
                </form>
            @endif
        </div>
    @empty
        <p class="footer-note">No notifications found.</p>
    @endforelse

    <div style="margin-top:10px;">{{ $notifications->links() }}</div>
</div>
@endsection

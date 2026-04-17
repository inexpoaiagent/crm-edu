@extends('layouts.portal')

@section('content')
<div class="card">
    <h2 style="margin-top:0;">Messages</h2>
    <form method="POST" action="/portal/messages">
        @csrf
        <textarea name="message" rows="4" style="width:100%;" placeholder="Write your message to agent/admin..." required></textarea>
        <div style="margin-top:8px;">
            <button type="submit">Send Message</button>
        </div>
    </form>
</div>

<div class="card" style="margin-top:12px;">
    <h3>Conversation</h3>
    @forelse($messages as $message)
        <div class="notif-item">
            <div style="display:flex;justify-content:space-between;gap:8px;">
                <strong>{{ ucfirst($message->sender_role) }}</strong>
                <span class="footer-note">{{ $message->created_at }}</span>
            </div>
            <div>{{ $message->body }}</div>
        </div>
    @empty
        <p class="footer-note">No messages yet.</p>
    @endforelse

    <div style="margin-top:10px;">{{ $messages->links() }}</div>
</div>
@endsection

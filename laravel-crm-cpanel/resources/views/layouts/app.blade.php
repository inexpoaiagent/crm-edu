<!doctype html>
<html lang="en" data-theme="{{ request()->cookie('theme', 'light') }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Vertue CRM</title>
    <link rel="stylesheet" href="/assets/app.css">
</head>
<body>
@php
    $authUser = request()->attributes->get('auth_user');
    $headerNotifications = collect();
    $headerUnread = 0;
    if ($authUser) {
        $headerNotifications = \App\Models\Notification::query()
            ->forTenant($authUser->tenant_id, $authUser->role_slug)
            ->where('user_id', $authUser->id)
            ->latest('id')
            ->limit(6)
            ->get();
        $headerUnread = $headerNotifications->whereNull('read_at')->count();
    }
@endphp
<div class="layout">
    <aside class="sidebar">
        <h1>Vertue CRM</h1>
        <a class="nav-link {{ request()->is('dashboard') ? 'active' : '' }}" href="/dashboard">Dashboard</a>
        <a class="nav-link {{ request()->is('students*') ? 'active' : '' }}" href="/students">Students</a>
        <a class="nav-link {{ request()->is('applications*') ? 'active' : '' }}" href="/applications">Applications</a>
        <a class="nav-link {{ request()->is('pipeline*') ? 'active' : '' }}" href="/pipeline">Pipeline Board</a>
        <a class="nav-link {{ request()->is('scholarships*') ? 'active' : '' }}" href="/scholarships">Scholarships</a>
        <a class="nav-link {{ request()->is('universities*') ? 'active' : '' }}" href="/universities">Universities</a>
        <a class="nav-link {{ request()->is('student-requests*') ? 'active' : '' }}" href="/student-requests">Student Requests</a>
        <a class="nav-link {{ request()->is('agents*') ? 'active' : '' }}" href="/agents">Agents & Roles</a>
        <a class="nav-link {{ request()->is('settings*') ? 'active' : '' }}" href="/settings">Settings</a>
        <form method="POST" action="/logout" style="margin-top:16px;">
            @csrf
            <button type="submit" class="secondary" style="width:100%;">Logout</button>
        </form>
    </aside>
    <main class="main">
        <div class="topbar">
            <div>
                <strong>{{ $title ?? 'CRM' }}</strong>
            </div>
            <div class="topbar-actions">
                <a class="icon-btn" title="Advanced Search" href="/search">S</a>
                <button class="icon-btn" title="Notifications" onclick="toggleNotificationPanel()">
                    N
                    @if($headerUnread > 0)
                        <span class="notif-dot">{{ $headerUnread }}</span>
                    @endif
                </button>
                <button class="icon-btn" title="Toggle Theme" onclick="toggleTheme()">T</button>
            </div>
        </div>

        <div id="notifPanel" class="notif-panel hidden">
            <div class="notif-panel-head">
                <strong>Notifications</strong>
                <a href="/notifications" class="tab">Open all</a>
            </div>
            @forelse($headerNotifications as $n)
                <div class="notif-item {{ $n->read_at ? '' : 'unread' }}">
                    <div><strong>{{ $n->title }}</strong></div>
                    <div class="footer-note">{{ $n->body }}</div>
                    @if(!$n->read_at)
                        <form method="POST" action="/notifications/{{ $n->id }}/read">
                            @csrf
                            <button class="secondary">Mark read</button>
                        </form>
                    @endif
                </div>
            @empty
                <div class="footer-note">No notifications.</div>
            @endforelse
        </div>

        @if(session('success'))
            <div class="card" style="border-color:#22c55e;margin-bottom:10px;">{{ session('success') }}</div>
        @endif
        @if($errors->any())
            <div class="card" style="border-color:#ef4444;margin-bottom:10px;">{{ $errors->first() }}</div>
        @endif

        @yield('content')
    </main>
</div>
<script>
    function toggleTheme() {
        const html = document.documentElement;
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        document.cookie = 'theme=' + next + ';path=/;max-age=31536000';
    }

    function toggleNotificationPanel() {
        const panel = document.getElementById('notifPanel');
        if (panel) {
            panel.classList.toggle('hidden');
        }
    }
</script>
</body>
</html>

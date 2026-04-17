<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Student Portal</title>
    <link rel="stylesheet" href="/assets/app.css">
</head>
<body>
<div class="layout" style="grid-template-columns:240px 1fr;">
    <aside class="sidebar">
        <h1>Student Portal</h1>
        <a class="nav-link {{ request()->is('portal/dashboard') ? 'active' : '' }}" href="/portal/dashboard">Dashboard</a>
        <a class="nav-link {{ request()->is('portal/applications') ? 'active' : '' }}" href="/portal/applications">My Applications</a>
        <a class="nav-link {{ request()->is('portal/documents') ? 'active' : '' }}" href="/portal/documents">My Documents</a>
        <a class="nav-link {{ request()->is('portal/universities') ? 'active' : '' }}" href="/portal/universities">Universities</a>
        <a class="nav-link {{ request()->is('portal/messages') ? 'active' : '' }}" href="/portal/messages">Messages</a>
        <form method="POST" action="/portal/logout" style="margin-top:16px;">
            @csrf
            <button type="submit" class="secondary" style="width:100%;">Logout</button>
        </form>
    </aside>
    <main class="main">
        @if(session('success'))
            <div class="card" style="border-color:#22c55e;margin-bottom:10px;">{{ session('success') }}</div>
        @endif
        @if($errors->any())
            <div class="card" style="border-color:#ef4444;margin-bottom:10px;">{{ $errors->first() }}</div>
        @endif
        @yield('content')
    </main>
</div>
</body>
</html>

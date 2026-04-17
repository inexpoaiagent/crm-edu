<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login | Vertue CRM</title>
    <link rel="stylesheet" href="/assets/app.css">
</head>
<body style="display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div class="card" style="width:400px;">
    <h2 style="margin-top:0;">Sign in</h2>
    <p class="footer-note">Default super admin: admincrm@vertue.com</p>
    @if($errors->any())
        <div class="card" style="border-color:#ef4444;margin-bottom:10px;">{{ $errors->first() }}</div>
    @endif
    <form method="POST" action="/login">
        @csrf
        <label>Email</label>
        <input type="email" name="email" value="{{ old('email') }}" required style="width:100%;margin:6px 0 10px;">
        <label>Password</label>
        <input type="password" name="password" required style="width:100%;margin:6px 0 14px;">
        <button type="submit" style="width:100%;">Login</button>
    </form>
</div>
</body>
</html>

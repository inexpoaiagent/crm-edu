@extends('layouts.app')

@section('content')
<div class="card">
    <h2 style="margin-top:0;">{{ $user->name }}</h2>
    <p><strong>Email:</strong> {{ $user->email }}</p>
    <p><strong>Role:</strong> {{ $user->role_slug }}</p>
    <p><strong>Language:</strong> {{ $user->language }}</p>
    <p><strong>Status:</strong> {{ $user->is_active ? 'Active' : 'Inactive' }}</p>
</div>
@endsection

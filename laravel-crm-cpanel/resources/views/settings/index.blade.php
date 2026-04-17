@extends('layouts.app')

@section('content')
<div class="two-col">
    <div class="card">
        <h3>Profile & Preferences</h3>
        <form method="POST" action="/settings/profile">
            @csrf
            <input name="name" value="{{ $user->name }}" placeholder="Name" style="width:100%;margin-bottom:8px;">
            <select name="language" style="width:100%;margin-bottom:8px;">
                <option value="en" {{ $user->language === 'en' ? 'selected' : '' }}>English</option>
                <option value="tr" {{ $user->language === 'tr' ? 'selected' : '' }}>Turkish</option>
                <option value="fa" {{ $user->language === 'fa' ? 'selected' : '' }}>Persian</option>
            </select>
            <select name="font_scale" style="width:100%;margin-bottom:8px;">
                <option value="sm">Small (Standard CRM)</option>
                <option value="base" selected>Base</option>
                <option value="lg">Large</option>
            </select>
            <select name="currency_preference" style="width:100%;margin-bottom:10px;">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="TRY">TRY</option>
            </select>
            <button>Save preferences</button>
        </form>
    </div>
    <div class="card">
        <h3>Change Password</h3>
        <form method="POST" action="/settings/password">
            @csrf
            <input type="password" name="current_password" placeholder="Current password" style="width:100%;margin-bottom:8px;">
            <input type="password" name="new_password" placeholder="New password" style="width:100%;margin-bottom:8px;">
            <input type="password" name="new_password_confirmation" placeholder="Confirm new password" style="width:100%;margin-bottom:10px;">
            <button>Update password</button>
        </form>
    </div>
</div>
@endsection

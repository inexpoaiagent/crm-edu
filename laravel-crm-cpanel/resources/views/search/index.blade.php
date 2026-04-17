@extends('layouts.app')

@section('content')
<div class="card">
    <h2 style="margin-top:0;">Professional Search</h2>
    <form method="GET" action="/search" class="toolbar">
        <input id="global-search" name="q" value="{{ $q }}" placeholder="Keyword">
        <select name="stage">
            <option value="">Student stage</option>
            @foreach(['lead','applied','offered','accepted','enrolled'] as $st)
                <option value="{{ $st }}" {{ $stage === $st ? 'selected' : '' }}>{{ ucfirst($st) }}</option>
            @endforeach
        </select>
        <input name="country" value="{{ $country }}" placeholder="Target country">
        <select name="status">
            <option value="">Application status</option>
            @foreach(['draft','submitted','under_review','accepted','rejected','enrolled'] as $s)
                <option value="{{ $s }}" {{ $status === $s ? 'selected' : '' }}>{{ ucfirst($s) }}</option>
            @endforeach
        </select>
        <button type="submit">Search</button>
    </form>
</div>

<div class="three-col" style="margin-top:12px;">
    <div class="card">
        <h3>Students ({{ $students->count() }})</h3>
        @forelse($students as $s)
            <p><a href="/students/{{ $s->id }}">{{ $s->full_name }}</a><br><span class="footer-note">{{ $s->email }}</span></p>
        @empty
            <p class="footer-note">No results.</p>
        @endforelse
    </div>
    <div class="card">
        <h3>Applications ({{ $applications->count() }})</h3>
        @forelse($applications as $a)
            <p><a href="/applications/{{ $a->id }}">#{{ $a->id }} - {{ $a->program }}</a><br><span class="footer-note">{{ ucfirst($a->status) }}</span></p>
        @empty
            <p class="footer-note">No results.</p>
        @endforelse
    </div>
    <div class="card">
        <h3>Universities ({{ $universities->count() }})</h3>
        @forelse($universities as $u)
            <p><a href="/universities/{{ $u->id }}">{{ $u->name }}</a><br><span class="footer-note">{{ $u->country }}</span></p>
        @empty
            <p class="footer-note">No results.</p>
        @endforelse
    </div>
</div>
@endsection

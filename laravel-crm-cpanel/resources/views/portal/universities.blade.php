@extends('layouts.portal')

@section('content')
<div class="card">
    <h2 style="margin-top:0;">Universities</h2>
    <div class="grid-4">
        @foreach($universities as $u)
            <div class="card">
                <strong>{{ $u->name }}</strong>
                <p class="footer-note">{{ $u->country }} | {{ $u->currency }}</p>
                <p>{{ $u->tuition_range }}</p>
            </div>
        @endforeach
    </div>
</div>
@endsection

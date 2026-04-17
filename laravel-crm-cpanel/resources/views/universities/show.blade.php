@extends('layouts.app')

@section('content')
<div class="card">
    <h2 style="margin-top:0;">{{ $university->name }}</h2>
    <p><strong>Country:</strong> {{ $university->country }} | <strong>Currency:</strong> {{ $university->currency }} | <strong>Website:</strong> <a href="{{ $university->website }}" target="_blank">{{ $university->website }}</a></p>
    <p><strong>Tuition:</strong> {{ $university->tuition_range }}</p>
    <p><strong>Languages:</strong> {{ $university->language }}</p>
    <p><strong>Deadline:</strong> {{ $university->deadline ?: '-' }}</p>
    <h3>Programs</h3>
    <pre style="white-space:pre-wrap;font-family:inherit;">{{ $university->programs_summary }}</pre>
    <h3>Visa / Notes</h3>
    <pre style="white-space:pre-wrap;font-family:inherit;">{{ $university->visa_notes }}</pre>
    <h3>Description</h3>
    <pre style="white-space:pre-wrap;font-family:inherit;">{{ $university->description }}</pre>
</div>
@endsection

@extends('layouts.app')

@section('content')
<div class="card">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
        <div>
            <h2 style="margin-top:0;">Application #{{ $application->id }}</h2>
            <p><strong>Status:</strong> <span class="badge {{ $application->status }}">{{ ucfirst($application->status) }}</span></p>
        </div>
        <a class="tab" href="/applications">Back to list</a>
    </div>

    <div class="two-col">
        <div class="card">
            <h3>Case Details</h3>
            <p><strong>Student:</strong> {{ $student?->full_name ?: ('#'.$application->student_id) }}</p>
            <p><strong>University:</strong> {{ $university?->name ?: ('#'.$application->university_id) }}</p>
            <p><strong>Program:</strong> {{ $application->program }}</p>
            <p><strong>Intake:</strong> {{ $application->intake }}</p>
            <p><strong>Deadline:</strong> {{ $application->deadline ?: '-' }}</p>
            <p><strong>Enroll probability:</strong> {{ $application->enroll_probability }}%</p>
            <p><strong>Explainability:</strong> {{ $application->explainability ?: '-' }}</p>
            <p><strong>Best next action:</strong> {{ $application->best_next_action ?: '-' }}</p>
            <h3>Notes</h3>
            <pre style="white-space:pre-wrap;font-family:inherit;">{{ $application->notes ?: '-' }}</pre>
        </div>

        <div class="card">
            <h3>Edit Application</h3>
            <form method="POST" action="/applications/{{ $application->id }}">
                @csrf
                @method('PUT')
                <div class="grid-4">
                    <select name="student_id" required>
                        @foreach($students as $s)
                            <option value="{{ $s->id }}" {{ $application->student_id == $s->id ? 'selected' : '' }}>{{ $s->full_name }}</option>
                        @endforeach
                    </select>
                    <select name="university_id" required>
                        @foreach($universities as $u)
                            <option value="{{ $u->id }}" {{ $application->university_id == $u->id ? 'selected' : '' }}>{{ $u->name }}</option>
                        @endforeach
                    </select>
                    <input name="program" value="{{ $application->program }}" required>
                    <input name="intake" value="{{ $application->intake }}" required>
                    <select name="status">
                        @foreach(['draft','submitted','under_review','accepted','rejected','enrolled'] as $s)
                            <option value="{{ $s }}" {{ $application->status === $s ? 'selected' : '' }}>{{ ucfirst($s) }}</option>
                        @endforeach
                    </select>
                    <input name="deadline" type="date" value="{{ $application->deadline }}">
                </div>
                <textarea name="notes" rows="5" style="width:100%;margin-top:8px;">{{ $application->notes }}</textarea>
                <div style="margin-top:10px;display:flex;gap:8px;">
                    <button type="submit">Save Changes</button>
                </div>
            </form>
            <form method="POST" action="/applications/{{ $application->id }}" onsubmit="return confirm('Delete application?')" style="margin-top:8px;">
                @csrf
                @method('DELETE')
                <button class="secondary" type="submit">Delete</button>
            </form>
        </div>
    </div>
</div>
@endsection

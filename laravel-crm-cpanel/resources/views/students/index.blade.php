@extends('layouts.app')

@section('content')
<div class="card">
    <div class="toolbar">
        <form id="searchForm" method="GET" action="/students" class="toolbar grow">
            <input id="global-search" type="text" name="q" placeholder="Search name, email, phone, field..." value="{{ $q }}">
            <select name="stage">
                <option value="">All stages</option>
                @foreach(['lead','applied','offered','accepted','enrolled'] as $st)
                    <option value="{{ $st }}" {{ $stage === $st ? 'selected' : '' }}>{{ ucfirst($st) }}</option>
                @endforeach
            </select>
            <input name="country" placeholder="Target country" value="{{ $country }}">
            <input name="gpa_min" type="number" step="0.01" min="0" max="4" placeholder="GPA min" value="{{ $gpaMin }}">
            <input name="gpa_max" type="number" step="0.01" min="0" max="4" placeholder="GPA max" value="{{ $gpaMax }}">
            <button type="submit">Search</button>
        </form>
        <button onclick="document.getElementById('addStudent').showModal()">+ Add Student</button>
    </div>

    <table class="table-compact">
        <thead>
        <tr>
            <th>Student</th><th>Nationality</th><th>GPA</th><th>Field</th><th>Stage</th><th>Actions</th>
        </tr>
        </thead>
        <tbody>
        @foreach($students as $student)
            <tr>
                <td><a href="/students/{{ $student->id }}">{{ $student->full_name }}</a><div class="footer-note">{{ $student->email }}</div></td>
                <td>{{ $student->nationality ?: '-' }}</td>
                <td>{{ $student->gpa ?: '-' }}</td>
                <td>{{ $student->field_of_study ?: '-' }}</td>
                <td><span class="badge {{ $student->stage }}">{{ ucfirst($student->stage) }}</span></td>
                <td style="display:flex;gap:6px;">
                    <a class="tab" href="/students/{{ $student->id }}">View</a>
                    <button class="secondary" type="button" onclick="document.getElementById('editStudent{{ $student->id }}').showModal()">Edit</button>
                    <form method="POST" action="/students/{{ $student->id }}" onsubmit="return confirm('Delete student?')">
                        @csrf @method('DELETE')
                        <button type="submit" class="secondary">Delete</button>
                    </form>
                </td>
            </tr>
        @endforeach
        </tbody>
    </table>
    <div style="margin-top:10px;">{{ $students->links() }}</div>
</div>

@foreach($students as $student)
<dialog id="editStudent{{ $student->id }}" class="card" style="max-width:820px;">
    <h3 style="margin-top:0;">Edit Student</h3>
    <form method="POST" action="/students/{{ $student->id }}">
        @csrf
        @method('PUT')
        <div class="grid-4">
            <input name="full_name" value="{{ $student->full_name }}" required>
            <input name="email" value="{{ $student->email }}" required>
            <input name="account_password" type="password" placeholder="Leave blank to keep password">
            <input name="phone" value="{{ $student->phone }}">
            <input name="nationality" value="{{ $student->nationality }}">
            <input name="gpa" value="{{ $student->gpa }}">
            <input name="field_of_study" value="{{ $student->field_of_study }}">
            <input name="english_level" value="{{ $student->english_level }}">
            <select name="stage">
                @foreach(['lead','applied','offered','accepted','enrolled'] as $st)
                    <option value="{{ $st }}" {{ $student->stage === $st ? 'selected' : '' }}>{{ ucfirst($st) }}</option>
                @endforeach
            </select>
            <input name="target_country" value="{{ $student->target_country }}">
            <input name="budget_usd" value="{{ $student->budget_usd }}">
            <input name="passport_number" value="{{ $student->passport_number }}">
            <select name="is_active">
                <option value="1" {{ (int) $student->is_active === 1 ? 'selected' : '' }}>Active</option>
                <option value="0" {{ (int) $student->is_active === 0 ? 'selected' : '' }}>Inactive</option>
            </select>
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;">
            <button type="submit">Save Changes</button>
            <button type="button" class="secondary" onclick="document.getElementById('editStudent{{ $student->id }}').close()">Cancel</button>
        </div>
    </form>
    <hr style="margin:12px 0;border:none;border-top:1px solid var(--border);">
    <form method="POST" action="/students/{{ $student->id }}/reset-password" class="toolbar">
        @csrf
        <input type="password" name="new_password" placeholder="Reset portal password (min 8)" required>
        <button type="submit" class="secondary">Reset Password</button>
    </form>
</dialog>
@endforeach

<dialog id="addStudent" class="card" style="max-width:760px;">
    <h3 style="margin-top:0;">Add Student</h3>
    <form method="POST" action="/students">
        @csrf
        <div class="grid-4">
            <input name="full_name" placeholder="Full name" required>
            <input name="email" placeholder="Email" required>
            <input name="account_password" type="password" placeholder="Portal password" required>
            <input name="phone" placeholder="Phone">
            <input name="nationality" placeholder="Nationality">
            <input name="gpa" placeholder="GPA">
            <input name="field_of_study" placeholder="Field">
            <input name="english_level" placeholder="English level">
            <select name="stage"><option value="lead">Lead</option><option value="applied">Applied</option><option value="offered">Offered</option><option value="accepted">Accepted</option><option value="enrolled">Enrolled</option></select>
            <input name="target_country" placeholder="Target country">
            <input name="budget_usd" placeholder="Budget USD">
            <input name="passport_number" placeholder="Passport #">
            <select name="is_active"><option value="1">Active login</option><option value="0">Inactive login</option></select>
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;">
            <button type="submit">Save</button>
            <button type="button" class="secondary" onclick="document.getElementById('addStudent').close()">Cancel</button>
        </div>
    </form>
</dialog>
@endsection

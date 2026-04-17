@extends('layouts.app')

@section('content')
<div class="card">
    <div class="toolbar">
        <form method="GET" action="/scholarships" class="toolbar grow">
            <input id="global-search" name="q" placeholder="Search title/description" value="{{ $q }}">
            <button type="submit">Search</button>
        </form>
        <button onclick="document.getElementById('addScholarship').showModal()">+ Add Scholarship</button>
    </div>
    <table class="table-compact">
        <thead><tr><th>Title</th><th>University</th><th>Discount</th><th>Description</th><th>Action</th></tr></thead>
        <tbody>
        @foreach($scholarships as $s)
            <tr>
                <td>{{ $s->title }}</td>
                <td>{{ $uniMap[$s->university_id]->name ?? ('#'.$s->university_id) }}</td>
                <td>{{ number_format((float) $s->discount_percentage, 2) }}%</td>
                <td>{{ $s->description ?: '-' }}</td>
                <td style="display:flex;gap:6px;">
                    <button class="secondary" type="button" onclick="document.getElementById('editScholarship{{ $s->id }}').showModal()">Edit</button>
                    <form method="POST" action="/scholarships/{{ $s->id }}" onsubmit="return confirm('Delete scholarship?')">
                        @csrf
                        @method('DELETE')
                        <button class="secondary">Delete</button>
                    </form>
                </td>
            </tr>
        @endforeach
        </tbody>
    </table>
    <div style="margin-top:10px;">{{ $scholarships->links() }}</div>
</div>

<dialog id="addScholarship" class="card" style="max-width:760px;">
    <h3 style="margin-top:0;">Add Scholarship</h3>
    <form method="POST" action="/scholarships">
        @csrf
        <div class="grid-4">
            <select name="university_id" required>
                @foreach($universities as $u)
                    <option value="{{ $u->id }}">{{ $u->name }}</option>
                @endforeach
            </select>
            <input name="title" placeholder="Scholarship title" required>
            <input name="discount_percentage" type="number" step="0.01" min="0" max="100" placeholder="Discount %" required>
        </div>
        <textarea name="description" rows="4" style="width:100%;margin-top:8px;" placeholder="Description"></textarea>
        <div style="margin-top:10px;display:flex;gap:8px;">
            <button type="submit">Save</button>
            <button type="button" class="secondary" onclick="document.getElementById('addScholarship').close()">Cancel</button>
        </div>
    </form>
</dialog>

@foreach($scholarships as $s)
<dialog id="editScholarship{{ $s->id }}" class="card" style="max-width:760px;">
    <h3 style="margin-top:0;">Edit Scholarship</h3>
    <form method="POST" action="/scholarships/{{ $s->id }}">
        @csrf
        @method('PUT')
        <div class="grid-4">
            <select name="university_id" required>
                @foreach($universities as $u)
                    <option value="{{ $u->id }}" {{ (int) $s->university_id === (int) $u->id ? 'selected' : '' }}>{{ $u->name }}</option>
                @endforeach
            </select>
            <input name="title" value="{{ $s->title }}" required>
            <input name="discount_percentage" type="number" step="0.01" min="0" max="100" value="{{ $s->discount_percentage }}" required>
        </div>
        <textarea name="description" rows="4" style="width:100%;margin-top:8px;">{{ $s->description }}</textarea>
        <div style="margin-top:10px;display:flex;gap:8px;">
            <button type="submit">Save Changes</button>
            <button type="button" class="secondary" onclick="document.getElementById('editScholarship{{ $s->id }}').close()">Cancel</button>
        </div>
    </form>
</dialog>
@endforeach
@endsection

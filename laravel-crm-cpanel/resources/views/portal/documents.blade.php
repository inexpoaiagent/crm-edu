@extends('layouts.portal')

@section('content')
<div class="card">
    <h2 style="margin-top:0;">My Documents</h2>
    <form method="POST" action="/portal/documents" enctype="multipart/form-data" class="toolbar">
        @csrf
        <select name="type">
            <option value="passport">Passport</option>
            <option value="diploma">Diploma</option>
            <option value="transcript">Transcript</option>
            <option value="english_certificate">English Certificate</option>
            <option value="photo">Photo</option>
        </select>
        <input type="file" name="file" required>
        <button>Upload</button>
    </form>
    <table>
        <thead><tr><th>Type</th><th>File</th><th>Status</th><th>Expiry</th></tr></thead>
        <tbody>
        @foreach($documents as $d)
            <tr>
                <td>{{ $d->type }}</td>
                <td><a href="{{ $d->file_url }}" target="_blank">{{ $d->file_name }}</a></td>
                <td>{{ ucfirst($d->status) }}</td>
                <td>{{ $d->expiry_date ?: '-' }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
@endsection

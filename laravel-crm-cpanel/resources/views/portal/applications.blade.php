@extends('layouts.portal')

@section('content')
<div class="card">
    <h2 style="margin-top:0;">My Applications</h2>
    <table>
        <thead><tr><th>Program</th><th>Status</th><th>Deadline</th></tr></thead>
        <tbody>
        @foreach($applications as $a)
            <tr>
                <td>{{ $a->program }}</td>
                <td>{{ ucfirst($a->status) }}</td>
                <td>{{ $a->deadline ?: '-' }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
@endsection

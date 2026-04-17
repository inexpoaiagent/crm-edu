@extends('layouts.app')

@section('content')
<div class="card">
    <div class="toolbar">
        <button onclick="document.getElementById('addUser').showModal()">+ Add Admin/Agent/SubAgent</button>
    </div>
    <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
        @foreach($users as $u)
            <tr>
                <td><a href="/agents/{{ $u->id }}">{{ $u->name }}</a></td>
                <td>{{ $u->email }}</td>
                <td>{{ $u->role_slug }}</td>
                <td>{{ $u->is_active ? 'Yes' : 'No' }}</td>
                <td style="display:flex;gap:6px;">
                    <button class="secondary" onclick="openUserEdit{{ $u->id }}()">Edit</button>
                    <form method="POST" action="/agents/{{ $u->id }}" onsubmit="return confirm('Delete user?')">@csrf @method('DELETE')<button class="secondary">Delete</button></form>
                </td>
            </tr>
            <script>
                function openUserEdit{{ $u->id }}() {
                    const name = prompt('Name', @json($u->name));
                    if (!name) return;
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = '/agents/{{ $u->id }}';
                    form.innerHTML = '@csrf @method("PUT")' +
                        `<input name="name" value="${name}">` +
                        `<input name="email" value="{{ $u->email }}">` +
                        `<input name="role_slug" value="{{ $u->role_slug }}">`;
                    document.body.appendChild(form); form.submit();
                }
            </script>
        @endforeach
        </tbody>
    </table>
    <div style="margin-top:10px;">{{ $users->links() }}</div>
</div>

<div class="card" style="margin-top:12px;">
    <h3>Role Manager</h3>
    <p class="footer-note">Permission groups: Students, Applications, Documents, Finance.</p>
    <div class="tabs">
        <span class="tab">students.view</span>
        <span class="tab">students.create</span>
        <span class="tab">applications.view</span>
        <span class="tab">documents.verify</span>
        <span class="tab">finance.view</span>
    </div>
</div>

<dialog id="addUser" class="card" style="max-width:560px;">
    <h3 style="margin-top:0;">Add User</h3>
    <form method="POST" action="/agents">
        @csrf
        <input name="name" placeholder="Name" required style="width:100%;margin-bottom:8px;">
        <input name="email" placeholder="Email" type="email" required style="width:100%;margin-bottom:8px;">
        <input name="password" placeholder="Password" type="password" required style="width:100%;margin-bottom:8px;">
        <select name="role_slug" style="width:100%;margin-bottom:10px;">
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
            <option value="sub_agent">SubAgent</option>
            <option value="student">Student</option>
        </select>
        <button type="submit">Create user</button>
    </form>
</dialog>
@endsection

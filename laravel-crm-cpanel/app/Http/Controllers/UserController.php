<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class UserController extends Controller
{
    public function index(Request $request): View
    {
        $user = $this->authUser($request);
        $users = User::query()
            ->forTenant($user->tenant_id, $user->role_slug)
            ->whereNull('deleted_at')
            ->latest('id')
            ->paginate(15);
        $roles = Role::query()->where(function ($q) use ($user) {
            $q->where('tenant_id', $user->tenant_id)->orWhere('is_system', 1);
        })->orderBy('name')->get();

        return view('users.index', compact('users', 'roles'));
    }

    public function show(Request $request, int $id): View
    {
        $auth = $this->authUser($request);
        $user = User::query()->forTenant($auth->tenant_id, $auth->role_slug)->whereNull('deleted_at')->findOrFail($id);
        return view('users.show', compact('user'));
    }

    public function store(Request $request): RedirectResponse
    {
        $auth = $this->authUser($request);
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:120',
            'password' => 'required|string|min:8',
            'role_slug' => 'required|string|max:60',
        ]);
        $data['tenant_id'] = $auth->tenant_id;
        $data['language'] = 'en';
        $data['is_active'] = 1;
        $data['password'] = Hash::make($data['password']);
        $user = User::query()->create($data);
        $this->audit($request, 'user.create', 'user', $user->id, ['role' => $data['role_slug']]);

        return back()->with('success', 'User created.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $auth = $this->authUser($request);
        $user = User::query()->forTenant($auth->tenant_id, $auth->role_slug)->whereNull('deleted_at')->findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:120',
            'role_slug' => 'required|string|max:60',
            'is_active' => 'nullable|boolean',
            'password' => 'nullable|string|min:8',
        ]);
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        $user->update($data);
        $this->audit($request, 'user.update', 'user', $user->id, $data);

        return back()->with('success', 'User updated.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $auth = $this->authUser($request);
        $user = User::query()->forTenant($auth->tenant_id, $auth->role_slug)->whereNull('deleted_at')->findOrFail($id);
        $user->update(['deleted_at' => now()]);
        $this->audit($request, 'user.delete', 'user', $id);

        return back()->with('success', 'User deleted.');
    }
}

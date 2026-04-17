<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function showLogin(): View
    {
        return view('auth.login');
    }

    public function login(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->where('email', $data['email'])
            ->where('role_slug', '!=', 'student')
            ->whereNull('deleted_at')
            ->first();
        if (!$user || !$user->is_active || !Hash::check($data['password'], $user->password)) {
            return back()->withErrors(['email' => 'Invalid credentials'])->withInput();
        }
        Auth::guard('student')->logout();
        Auth::guard('crm')->login($user, false);
        $request->session()->regenerate();

        return redirect('/dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('crm')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}

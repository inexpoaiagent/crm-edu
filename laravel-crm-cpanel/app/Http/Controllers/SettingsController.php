<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class SettingsController extends Controller
{
    public function index(Request $request): View
    {
        return view('settings.index', ['user' => $this->authUser($request)]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $this->authUser($request);
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'language' => 'required|string|in:en,tr,fa',
            'font_scale' => 'nullable|string|in:sm,base,lg',
            'currency_preference' => 'nullable|string|in:USD,EUR,TRY',
        ]);
        User::query()->where('id', $user->id)->update($data);
        $this->audit($request, 'settings.profile.update', 'user', $user->id, $data);

        return back()->with('success', 'Profile updated.');
    }

    public function changePassword(Request $request): RedirectResponse
    {
        $user = $this->authUser($request);
        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);
        if (!Hash::check($data['current_password'], $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is not valid']);
        }

        User::query()->where('id', $user->id)->update(['password' => Hash::make($data['new_password'])]);
        $this->audit($request, 'settings.password.update', 'user', $user->id);

        return back()->with('success', 'Password changed.');
    }
}

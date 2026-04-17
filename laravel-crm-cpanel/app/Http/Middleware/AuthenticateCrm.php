<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateCrm
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('crm')->check()) {
            return redirect('/login');
        }

        $user = Auth::guard('crm')->user();
        if (!$user || $user->role_slug === 'student' || !$user->is_active) {
            Auth::guard('crm')->logout();
            return redirect('/login')->withErrors(['email' => 'You are not authorized to access CRM.']);
        }

        $request->attributes->set('auth_user', $user);
        return $next($request);
    }
}

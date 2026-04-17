<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateStudent
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('student')->check()) {
            return redirect('/portal/login');
        }

        $user = Auth::guard('student')->user();
        if (!$user || $user->role_slug !== 'student' || !$user->is_active) {
            Auth::guard('student')->logout();
            return redirect('/portal/login')->withErrors(['email' => 'Student account is inactive or invalid.']);
        }

        $request->attributes->set('auth_user', $user);
        return $next($request);
    }
}

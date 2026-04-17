<?php

namespace App\Http\Middleware;

use App\Support\AuthUser;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateJwt
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = AuthUser::fromRequest($request);
        if (!$user) {
            return redirect('/login')->withErrors(['email' => 'Session expired. Please login again.']);
        }

        $request->attributes->set('auth_user', $user);
        return $next($request);
    }
}

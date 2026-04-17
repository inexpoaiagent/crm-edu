<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->attributes->get('auth_user');
        if (!$user) {
            return redirect('/login');
        }

        if ($user->role_slug === 'super_admin') {
            return $next($request);
        }

        if (!$user->hasPermission($permission)) {
            abort(403, 'You do not have permission for this action.');
        }

        return $next($request);
    }
}

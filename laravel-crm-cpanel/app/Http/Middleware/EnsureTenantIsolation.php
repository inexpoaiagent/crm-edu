<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantIsolation
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->attributes->get('auth_user');
        if (!$user) {
            return redirect('/login');
        }

        // Non-super admins must stay inside own tenant.
        if ($user->role_slug !== 'super_admin') {
            app()->instance('current_tenant_id', $user->tenant_id);
        }

        return $next($request);
    }
}

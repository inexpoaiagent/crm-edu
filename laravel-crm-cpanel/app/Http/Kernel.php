<?php

namespace App\Http;

use App\Http\Middleware\AuthenticateJwt;
use App\Http\Middleware\AuthenticateCrm;
use App\Http\Middleware\AuthenticateStudent;
use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsureTenantIsolation;
use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $middleware = [
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    protected $routeMiddleware = [
        'auth.jwt' => AuthenticateJwt::class,
        'auth.crm' => AuthenticateCrm::class,
        'auth.student' => AuthenticateStudent::class,
        'tenant' => EnsureTenantIsolation::class,
        'permission' => EnsurePermission::class,
    ];
}

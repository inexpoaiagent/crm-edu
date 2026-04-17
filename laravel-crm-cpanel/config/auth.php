<?php

return [
    'defaults' => [
        'guard' => env('AUTH_GUARD', 'crm'),
        'passwords' => 'users',
    ],

    'guards' => [
        'crm' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        'student' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,
];

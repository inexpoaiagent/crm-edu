<?php

return [
    'driver' => env('SESSION_DRIVER', 'file'),
    'connection' => null,
    'store' => null,
    'lifetime' => (int) env('SESSION_LIFETIME', 120),
    'expire_on_close' => false,
    'encrypt' => true,
    'files' => storage_path('framework/sessions'),
    'table' => 'sessions',
    'lottery' => [2, 100],
    'cookie' => env('SESSION_COOKIE', 'vertue_crm_session'),
    'path' => '/',
    'domain' => null,
    'secure' => env('SESSION_SECURE_COOKIE', false),
    'http_only' => true,
    'same_site' => 'lax',
    'partitioned' => false,
];

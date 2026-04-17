<?php

namespace App\Support;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;

class AuthUser
{
    public static function fromRequest(Request $request): ?User
    {
        $token = $request->cookie('crm_token') ?? $request->bearerToken();
        if (!$token) {
            return null;
        }

        try {
            $payload = JWT::decode($token, new Key((string) env('JWT_SECRET'), 'HS256'));
            $user = User::query()->where('id', $payload->uid ?? 0)->whereNull('deleted_at')->first();
            if (!$user || !$user->is_active) {
                return null;
            }

            return $user;
        } catch (\Throwable) {
            return null;
        }
    }

    public static function tokenFor(User $user): string
    {
        $ttl = (int) env('JWT_TTL_MINUTES', 120);
        $exp = time() + ($ttl * 60);
        $payload = [
            'iss' => config('app.url'),
            'sub' => $user->id,
            'uid' => $user->id,
            'tenant_id' => $user->tenant_id,
            'role' => $user->role_slug,
            'exp' => $exp,
            'iat' => time(),
        ];

        return JWT::encode($payload, (string) env('JWT_SECRET'), 'HS256');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;

class Controller extends BaseController
{
    use AuthorizesRequests;
    use ValidatesRequests;

    protected function authUser(Request $request): User
    {
        return $request->attributes->get('auth_user');
    }

    protected function tenantId(Request $request): ?int
    {
        return $this->authUser($request)->tenant_id;
    }

    protected function audit(Request $request, string $action, string $entityType, int $entityId, array $diff = []): void
    {
        $user = $this->authUser($request);
        AuditLog::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'diff_json' => json_encode($diff, JSON_UNESCAPED_UNICODE),
            'ip_address' => $request->ip(),
        ]);
    }
}

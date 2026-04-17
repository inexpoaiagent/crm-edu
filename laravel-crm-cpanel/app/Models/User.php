<?php

namespace App\Models;

use App\Models\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'password',
        'role_slug',
        'language',
        'is_active',
        'deleted_at',
    ];

    protected $hidden = ['password'];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function hasPermission(string $permission): bool
    {
        $count = DB::table('role_permissions')
            ->join('roles', 'roles.id', '=', 'role_permissions.role_id')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->where('roles.slug', $this->role_slug)
            ->where('permissions.key', $permission)
            ->count();

        return $count > 0;
    }
}

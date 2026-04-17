<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait TenantScoped
{
    public function scopeForTenant(Builder $query, ?int $tenantId, ?string $roleSlug = null): Builder
    {
        if ($roleSlug === 'super_admin') {
            return $query;
        }

        return $query->where($query->getModel()->getTable().'.tenant_id', $tenantId ?? -1);
    }
}

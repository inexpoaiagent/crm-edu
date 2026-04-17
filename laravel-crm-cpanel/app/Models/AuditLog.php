<?php

namespace App\Models;

use App\Models\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'diff_json',
        'ip_address',
    ];
}

<?php

namespace App\Models;

use App\Models\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'type',
        'title',
        'body',
        'read_at',
        'meta_json',
    ];
}

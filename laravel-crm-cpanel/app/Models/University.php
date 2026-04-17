<?php

namespace App\Models;

use App\Models\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Model;

class University extends Model
{
    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'name',
        'country',
        'website',
        'currency',
        'tuition_range',
        'language',
        'programs_summary',
        'deadline',
        'visa_notes',
        'description',
        'is_active',
    ];
}

<?php

namespace App\Models;

use App\Models\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'student_id',
        'assigned_to',
        'title',
        'description',
        'priority',
        'status',
        'deadline',
        'escalation_level',
    ];
}

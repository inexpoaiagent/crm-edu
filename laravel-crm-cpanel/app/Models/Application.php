<?php

namespace App\Models;

use App\Models\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'student_id',
        'university_id',
        'program',
        'intake',
        'status',
        'deadline',
        'notes',
        'enroll_probability',
        'best_next_action',
        'explainability',
        'last_activity_at',
    ];
}

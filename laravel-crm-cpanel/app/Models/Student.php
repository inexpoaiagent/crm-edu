<?php

namespace App\Models;

use App\Models\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'agent_id',
        'sub_agent_id',
        'full_name',
        'email',
        'phone',
        'nationality',
        'gpa',
        'field_of_study',
        'english_level',
        'target_country',
        'budget_usd',
        'passport_number',
        'stage',
        'stage_temperature',
        'is_active',
        'deleted_at',
    ];
}

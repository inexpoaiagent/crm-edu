<?php

namespace App\Models;

use App\Models\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Model;

class StudentRequest extends Model
{
    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'full_name',
        'email',
        'phone',
        'nationality',
        'target_program',
        'status',
        'review_note',
        'processed_by',
        'processed_at',
    ];
}

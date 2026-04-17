<?php

namespace App\Models;

use App\Models\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Model;

class Scholarship extends Model
{
    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'university_id',
        'title',
        'discount_percentage',
        'description',
    ];
}

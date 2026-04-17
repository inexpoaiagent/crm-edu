<?php

namespace App\Models;

use App\Models\Concerns\TenantScoped;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'student_id',
        'type',
        'file_url',
        'file_name',
        'status',
        'expiry_date',
        'ocr_json',
    ];
}

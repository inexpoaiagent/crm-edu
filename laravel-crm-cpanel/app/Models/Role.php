<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['tenant_id', 'name', 'slug', 'is_system'];
}

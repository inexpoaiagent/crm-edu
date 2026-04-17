<?php

namespace App\Support;

use App\Models\User;

trait AuthorizesRole
{
    public function allow(User $user, array $roles): bool
    {
        return in_array($user->role_slug, $roles, true);
    }
}

<?php

namespace App\Middleware;

use App\Core\Auth;
use RuntimeException;

class RoleMiddleware
{
    public function handle(
        string|array $roles
    ): array {

        if (is_string($roles)) {
            $roles = [$roles];
        }

        $user = Auth::user();

        $accountType =
            $user['account_type'];

        if (!in_array(
            $accountType,
            $roles,
            true
        )) {

            throw new RuntimeException(
                'You do not have permission to access this resource'
            );
        }

        return $user;
    }
}
<?php

namespace App\Middleware;

use App\Core\Auth;
use RuntimeException;

class AuthMiddleware
{
    public function handle(): array
    {
        try {

            return Auth::user();

        } catch (\Throwable $e) {

            throw new RuntimeException(
                $e->getMessage()
            );
        }
    }
}
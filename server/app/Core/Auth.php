<?php

namespace App\Core;

use App\Models\AuthAccount;
use App\Models\AuthSession;
use RuntimeException;

class Auth
{
    private static ?array $account = null;

    /**
     * Get Bearer Token
     */
    public static function token(): ?string
    {
        $header = '';

        // Apache / PHP
        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $header = $_SERVER['HTTP_AUTHORIZATION'];
        }

        // Apache fallback
        if (
            $header === '' &&
            !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])
        ) {
            $header =
                $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        // getallheaders fallback
        if (
            $header === '' &&
            function_exists('getallheaders')
        ) {
            $headers = getallheaders();

            foreach ($headers as $key => $value) {
                if (
                    strtolower($key) ===
                    'authorization'
                ) {
                    $header = $value;
                    break;
                }
            }
        }

        if ($header === '') {
            return null;
        }

        if (!preg_match(
            '/^Bearer\s+(.+)$/i',
            trim($header),
            $matches
        )) {
            return null;
        }

        return trim($matches[1]);
    }

    /**
     * Get current authenticated account
     */
    public static function user(): array
    {
        if (self::$account !== null) {
            return self::$account;
        }

        $token = self::token();

        if (!$token) {
            throw new RuntimeException(
                'Authorization token is required'
            );
        }

        $tokenHash = hash(
            'sha256',
            $token
        );

        $sessionModel = new AuthSession();

        $session = $sessionModel
            ->where(
                'session_token_hash',
                '=',
                $tokenHash
            )
            ->where(
                'revoked_at',
                'IS',
                null
            )
            ->first();

        if (!$session) {
            throw new RuntimeException(
                'Invalid or revoked token'
            );
        }

        /*
         * Check expiration
         */
        if (
            !empty($session['expires_at']) &&
            strtotime($session['expires_at']) < time()
        ) {
            throw new RuntimeException(
                'Token has expired'
            );
        }

        /*
         * Get Auth Account
         */
        $accountModel = new AuthAccount();

        $account = $accountModel
            ->where(
                'auth_id',
                '=',
                $session['auth_id']
            )
            ->first();

        if (!$account) {
            throw new RuntimeException(
                'Authentication account not found'
            );
        }

        /*
         * Check account
         */
        if ($account['status'] !== 'active') {
            throw new RuntimeException(
                'Account is not active'
            );
        }

        if (!(bool) $account['login_enabled']) {
            throw new RuntimeException(
                'Login is disabled'
            );
        }

        /*
         * Update session
         */
        $sessionModel->update(
            $session['session_id'],
            [
                'last_seen_at' =>
                    date('Y-m-d H:i:s')
            ]
        );

        self::$account = [
            'session_id' =>
                (int) $session['session_id'],

            'auth_id' =>
                (int) $account['auth_id'],

            'username' =>
                $account['username'],

            'account_type' =>
                $account['account_type'],

            'user_id' =>
                $account['user_id'] ?? null,

            'customer_id' =>
                $account['customer_id'] ?? null,

            'vendor_id' =>
                $account['vendor_id'] ?? null
        ];

        return self::$account;
    }

    /**
     * Check authentication
     */
    public static function check(): bool
    {
        try {
            self::user();

            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Logout current session
     */
    public static function logout(): bool
    {
        $token = self::token();

        if (!$token) {
            return false;
        }

        $tokenHash = hash(
            'sha256',
            $token
        );

        $sessionModel = new AuthSession();

        $session = $sessionModel
            ->where(
                'session_token_hash',
                '=',
                $tokenHash
            )
            ->where(
                'revoked_at',
                'IS',
                null
            )
            ->first();

        if (!$session) {
            return false;
        }

        return $sessionModel->update(
            $session['session_id'],
            [
                'revoked_at' =>
                    date('Y-m-d H:i:s')
            ]
        );
    }

    /**
     * Get account type
     */
    public static function type(): string
    {
        return self::user()['account_type'];
    }

    /**
     * Check account type
     */
    public static function is(string $type): bool
    {
        return self::type() === $type;
    }
    public static function isCustomer(): bool
    {
        return self::is('customer');
    }

    public static function isVendor(): bool
    {
        return self::is('vendor');
    }

    public static function isUser(): bool
    {
        return self::is('user');
    }
}
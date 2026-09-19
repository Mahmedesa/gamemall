<?php

namespace App\Core;

use App\Models\AuthAccount;
use App\Models\AuthSession;
use App\Models\Vendor;
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

        /**
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

        /**
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

        /**
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

        /**
         * Get Vendor Profile
         *
         * auth_account.vendor_id
         *      ↓
         * shop_vendors_com.Vendors_com_id
         */
        $vendor = null;

        if (
            $account['account_type'] === 'vendor' &&
            !empty($account['vendor_id'])
        ) {
            $vendorModel = new Vendor();

            $vendor = $vendorModel
                ->where(
                    'Vendors_com_id',
                    '=',
                    (int) $account['vendor_id']
                )
                ->where(
                    'is_active',
                    '=',
                    1
                )
                ->first();

            if (!$vendor) {
                throw new RuntimeException(
                    'Vendor profile not found or inactive'
                );
            }
        }

        /**
         * Update session
         */
        $sessionModel->update(
            $session['session_id'],
            [
                'last_seen_at' =>
                    date('Y-m-d H:i:s')
            ]
        );

        /**
         * Build authenticated user
         */
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
                $account['vendor_id'] ?? null,

            /*
             * Vendor profile data
             */
            'email' =>
                $vendor['email'] ?? null,

            'vendor_name' =>
                $vendor['Vendors_com_name'] ?? null,

            'trade_name' =>
                $vendor['Trade_name'] ?? null,

            'owner_name' =>
                $vendor['com_owner_name'] ?? null,
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

    /**
     * Check customer account
     */
    public static function isCustomer(): bool
    {
        return self::is('customer');
    }

    /**
     * Check vendor account
     */
    public static function isVendor(): bool
    {
        return self::is('vendor');
    }

    /**
     * Check user account
     */
    public static function isUser(): bool
    {
        return self::is('user');
    }
}


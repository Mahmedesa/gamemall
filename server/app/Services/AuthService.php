<?php

namespace App\Services;

use App\Models\AuthAccount;
use App\Models\User;
use App\Models\Customer;
use App\Models\Vendor;
use App\Core\Database;
use App\Models\AuthSession;
use RuntimeException;

class AuthService
{
    private AuthAccount $authAccount;
    private User $user;
    private Customer $customer;
    private Vendor $vendor;
    private AuthSession $authSession;

    public function __construct()
    {
        $this->authAccount = new AuthAccount();
        $this->user = new User();
        $this->customer = new Customer();
        $this->vendor = new Vendor();
        $this->authSession = new AuthSession();
    }

    /**
     * Check if username already exists
     */
    public function usernameExists(string $username): bool
    {
        return $this->authAccount
            ->where('username', '=', $username)
            ->exists();
    }

    /**
     * Create password hash
     */
    private function hashPassword(string $password): string
    {
        return password_hash(
            $password,
            PASSWORD_DEFAULT
        );
    }

    /**
     * Verify password
     */
    private function verifyPassword(
        string $password,
        string $hash
    ): bool {
        return password_verify(
            $password,
            $hash
        );
    }

    /**
     * Register User
     */
    public function registerUser(
        array $data
    ): array {

        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';

        if ($username === '') {
            throw new RuntimeException(
                'Username is required'
            );
        }

        if ($password === '') {
            throw new RuntimeException(
                'Password is required'
            );
        }

        if ($this->usernameExists($username)) {
            throw new RuntimeException(
                'Username already exists'
            );
        }

        $db = Database::connection();

        try {

            $db->beginTransaction();

            /*
             * Create User
             */
            $userData = [
                'public_id' => $data['public_id'] ?? null,
                'username' => $username,
                'first_name' => $data['first_name'] ?? null,
                'last_name' => $data['last_name'] ?? null,
                'display_name' => $data['display_name'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'user_type' => $data['user_type'] ?? null,
                'status' => $data['status'] ?? 'active',
                'login_enabled' => 1,
                'profile_completed' => 0,
                'failed_login_attempts' => 0,
                'roles_id' => $data['roles_id'] ?? null,
                'profile_type' => $data['profile_type'] ?? null
            ];

            $this->user->create($userData);

            $userId = (int) $db->lastInsertId();

            /*
             * Create Auth Account
             */
            $this->authAccount->create([
                'username' => $username,
                'password_hash' => $this->hashPassword($password),
                'account_type' => 'user',
                'user_id' => $userId,
                'status' => 'active',
                'login_enabled' => 1,
                'two_factor_enabled' => 0,
                'failed_login_attempts' => 0
            ]);

            $db->commit();

            return [
                'id' => $userId,
                'username' => $username,
                'account_type' => 'user'
            ];

        } catch (\Throwable $e) {

            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $e;
        }
    }

    /**
     * Register Customer
     */
    public function registerCustomer(
        array $data
    ): array {

        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';

        if ($username === '') {
            throw new RuntimeException(
                'Username is required'
            );
        }

        if ($password === '') {
            throw new RuntimeException(
                'Password is required'
            );
        }

        if ($this->usernameExists($username)) {
            throw new RuntimeException(
                'Username already exists'
            );
        }

        $db = Database::connection();

        try {

            $db->beginTransaction();

            /*
             * Create Customer
             */
            $customerData = [
                'first_name' => $data['first_name'] ?? null,
                'last_name' => $data['last_name'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'Gender' => $data['Gender'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'is_active' => 1
            ];

            $this->customer->create(
                $customerData
            );

            $customerId = (int) $db->lastInsertId();

            /*
             * Create Auth Account
             */
            $this->authAccount->create([
                'username' => $username,
                'password_hash' => $this->hashPassword($password),
                'account_type' => 'customer',
                'customer_id' => $customerId,
                'status' => 'active',
                'login_enabled' => 1,
                'two_factor_enabled' => 0,
                'failed_login_attempts' => 0
            ]);

            $db->commit();

            return [
                'id' => $customerId,
                'username' => $username,
                'account_type' => 'customer'
            ];

        } catch (\Throwable $e) {

            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $e;
        }
    }

    /**
     * Register Vendor
     */
    public function registerVendor(
        array $data
    ): array {

        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';

        if ($username === '') {
            throw new RuntimeException(
                'Username is required'
            );
        }

        if ($password === '') {
            throw new RuntimeException(
                'Password is required'
            );
        }

        if ($this->usernameExists($username)) {
            throw new RuntimeException(
                'Username already exists'
            );
        }

        $db = Database::connection();

        try {

            $db->beginTransaction();

            /*
             * Create Vendor
             */
            $vendorData = [
                'Vendors_com_name' =>
                    $data['Vendors_com_name'] ?? null,

                'Trade_name' =>
                    $data['Trade_name'] ?? null,

                'com_owner_name' =>
                    $data['com_owner_name'] ?? null,

                'activity_type_id' =>
                    $data['activity_type_id'] ?? null,

                'establishment_year' =>
                    $data['establishment_year'] ?? null,

                'Number_employees' =>
                    $data['Number_employees'] ?? null,

                'capital' =>
                    $data['capital'] ?? null,

                'About_company' =>
                    $data['About_company'] ?? null,

                'email' =>
                    $data['email'] ?? null,

                'security_question_id' =>
                    $data['security_question_id'] ?? null,

                'answer_question' =>
                    $data['answer_question'] ?? null,

                'is_active' => 1,

                'Enable_two_factor' => 0
            ];

            $this->vendor->create(
                $vendorData
            );

            $vendorId = (int) $db->lastInsertId();

            /*
             * Create Auth Account
             */
            $this->authAccount->create([
                'username' => $username,
                'password_hash' =>
                    $this->hashPassword($password),

                'account_type' => 'vendor',

                'vendor_id' => $vendorId,

                'status' => 'active',

                'login_enabled' => 1,

                'two_factor_enabled' => 0,

                'failed_login_attempts' => 0
            ]);

            $db->commit();

            return [
                'id' => $vendorId,
                'username' => $username,
                'account_type' => 'vendor'
            ];

        } catch (\Throwable $e) {

            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $e;
        }
    }


    private function createSession(
        int $authId
    ): string {

        $token = bin2hex(
            random_bytes(32)
        );

        $tokenHash = hash(
            'sha256',
            $token
        );

        $expiresAt = date(
            'Y-m-d H:i:s',
            time() + (60 * 60 * 24 * 7)
        );

        $this->authSession->create([
            'auth_id' => $authId,

            'session_token_hash' =>
                $tokenHash,

            'ip_address' =>
                $_SERVER['REMOTE_ADDR'] ?? null,

            'user_agent' =>
                $_SERVER['HTTP_USER_AGENT'] ?? null,

            'expires_at' =>
                $expiresAt,

            'last_seen_at' =>
                date('Y-m-d H:i:s')
        ]);

        return $token;
    }

    /**
     * Login
     */
    public function login(
        string $username,
        string $password
    ): array {

        $account = $this->authAccount
            ->where(
                'username',
                '=',
                $username
            )
            ->first();

        if (!$account) {
            throw new RuntimeException(
                'Invalid username or password'
            );
        }

        if (!(bool) $account['login_enabled']) {
            throw new RuntimeException(
                'Login is disabled'
            );
        }

        if ($account['status'] !== 'active') {
            throw new RuntimeException(
                'Account is not active'
            );
        }

        if (
            !$this->verifyPassword(
                $password,
                $account['password_hash']
            )
        ) {
            throw new RuntimeException(
                'Invalid username or password'
            );
        }

        $token = $this->createSession(
            (int) $account['auth_id']
        );

        return [
            'token' => $token,

            'expires_in' => 60 * 60 * 24 * 7,

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
    }
    public function logout(string $token): bool
    {
        $tokenHash = hash(
            'sha256',
            $token
        );

        $session = $this->authSession
            ->where(
                'session_token_hash',
                '=',
                $tokenHash
            )
            ->first();

        if (!$session) {
            return false;
        }

        return $this->authSession->update(
            $session['session_id'],
            [
                'revoked_at' =>
                    date('Y-m-d H:i:s')
            ]
        );
    }
}
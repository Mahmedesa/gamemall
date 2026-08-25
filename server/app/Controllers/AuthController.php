<?php

namespace App\Controllers;

use App\Services\AuthService;
use App\Core\Response;
use App\Core\Auth;
use App\Middleware\AuthMiddleware;
use Throwable;

class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    /**
     * Get JSON request body
     */
    private function getRequestData(): array
    {
        $input = file_get_contents('php://input');

        if (!$input) {
            return [];
        }

        $data = json_decode(
            $input,
            true
        );

        if (!is_array($data)) {
            return [];
        }

        return $data;
    }

    /**
     * Register User
     */
    public function registerUser(): void
    {
        try {

            $data = $this->getRequestData();

            $result = $this->authService
                ->registerUser($data);

            Response::success(
                $result,
                'User registered successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                400
            );
        }
    }

    /**
     * Register Customer
     */
    public function registerCustomer(): void
    {
        try {

            $data = $this->getRequestData();

            $result = $this->authService
                ->registerCustomer($data);

            Response::success(
                $result,
                'Customer registered successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                400
            );
        }
    }

    /**
     * Register Vendor
     */
    public function registerVendor(): void
    {
        try {

            $data = $this->getRequestData();

            $result = $this->authService
                ->registerVendor($data);

            Response::success(
                $result,
                'Vendor registered successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                400
            );
        }
    }

    /**
     * Login
     */
    public function login(): void
    {
        try {

            $data = $this->getRequestData();

            $username = trim(
                $data['username'] ?? ''
            );

            $password =
                $data['password'] ?? '';

            if ($username === '') {

                Response::error(
                    'Username is required',
                    422
                );

                return;
            }

            if ($password === '') {

                Response::error(
                    'Password is required',
                    422
                );

                return;
            }

            $result = $this->authService->login(
                $username,
                $password
            );

            Response::success(
                $result,
                'Login successful'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                401
            );
        }
    }

    /**
     * Current authenticated account
     */
    public function me(): void
    {
        try {

            $middleware = new AuthMiddleware();

            $user = $middleware->handle();

            Response::success(
                $user,
                'Authenticated successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                401
            );
        }
    }

    /**
     * Logout
     */
    public function logout(): void
    {
        try {

            $success = Auth::logout();

            if (!$success) {

                Response::error(
                    'Invalid or missing authentication token',
                    401
                );

                return;
            }

            Response::success(
                [],
                'Logged out successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                401
            );
        }
    }
   public function testCustomer(): void
    {
        Response::success(
            Auth::user(),
            'Customer access granted'
        );
    }
    public function testVendor(): void
    {
        Response::success(
            Auth::user(),
            'Vendor access granted'
        );
    }
}
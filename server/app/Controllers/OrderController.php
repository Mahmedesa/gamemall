<?php

namespace App\Controllers;

use App\Services\OrderService;
use App\Core\Response;
use App\Middleware\AuthMiddleware;
use RuntimeException;
use Throwable;

class OrderController
{
    private OrderService $orderService;

    public function __construct()
    {
        $this->orderService = new OrderService();
    }

    /**
     * Get authenticated user
     */
    private function authUser(): array
    {
        return (new AuthMiddleware())->handle();
    }

    /**
     * Get JSON request body
     */
    private function getRequestData(): array
    {
        $input = file_get_contents('php://input');

        if ($input === false || trim($input) === '') {
            return [];
        }

        $data = json_decode(
            $input,
            true
        );

        if (
            json_last_error() !== JSON_ERROR_NONE ||
            !is_array($data)
        ) {
            throw new RuntimeException(
                'Invalid JSON request body',
                422
            );
        }

        return $data;
    }

    /**
     * Resolve ID from query string or request body
     *
     * Example:
     * ?order_id=1
     *
     * OR
     *
     * {
     *     "order_id": 1
     * }
     */
    private function resolveId(
        array $data,
        string $key
    ): int {

        $value =
            $_GET[$key]
            ?? $data[$key]
            ?? null;

        if (
            $value === null ||
            filter_var(
                $value,
                FILTER_VALIDATE_INT
            ) === false
        ) {
            throw new RuntimeException(
                "A valid {$key} is required",
                422
            );
        }

        $value = (int) $value;

        if ($value <= 0) {
            throw new RuntimeException(
                "A valid {$key} is required",
                422
            );
        }

        return $value;
    }

    /**
     * Convert exception code to HTTP status
     */
    private function statusFromException(
        Throwable $e
    ): int {

        $code = $e->getCode();

        if (
            in_array(
                $code,
                [400, 401, 403, 404, 409, 422, 500],
                true
            )
        ) {
            return $code;
        }

        return 500;
    }

    /*
    |--------------------------------------------------------------------------
    | Customer
    |--------------------------------------------------------------------------
    */

    /**
     * Checkout
     *
     * POST /api/customer/orders/checkout
     *
     * Body:
     *
     * {
     *     "address_id": 1,
     *     "payment_method_id": 1,
     *     "notes": "Please call me before delivery"
     * }
     */
    public function checkout(): void
    {
        try {

            $authUser =
                $this->authUser();

            $data =
                $this->getRequestData();

            $result =
                $this->orderService->checkout(
                    $authUser,
                    $data
                );

            Response::success(
                $result,
                'Order(s) placed successfully',
                201
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * Get current customer's orders
     *
     * GET /api/customer/orders
     */
    public function myOrders(): void
    {
        try {

            $authUser =
                $this->authUser();

            $result =
                $this->orderService->listMyOrders(
                    $authUser
                );

            Response::success(
                $result,
                'Orders fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * Show one order
     *
     * GET /api/orders/show?order_id=1
     *
     * Customer:
     * Can view his own order.
     *
     * Vendor:
     * Can view orders belonging to his store.
     */
    public function show(): void
    {
        try {

            $authUser =
                $this->authUser();

            $orderId =
                $this->resolveId(
                    [],
                    'order_id'
                );

            $result =
                $this->orderService->showOrder(
                    $authUser,
                    $orderId
                );

            Response::success(
                $result,
                'Order fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Vendor
    |--------------------------------------------------------------------------
    */

    /**
     * Get orders of a specific store
     *
     * GET /api/vendor/orders?store_id=1
     */
    public function storeOrders(): void
    {
        try {

            $authUser =
                $this->authUser();

            $storeId =
                $this->resolveId(
                    [],
                    'store_id'
                );

            $result =
                $this->orderService->listStoreOrders(
                    $authUser,
                    $storeId
                );

            Response::success(
                $result,
                'Store orders fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * Update order status
     *
     * POST /api/vendor/orders/update-status
     *
     * Body:
     *
     * {
     *     "order_id": 1,
     *     "status": "CONFIRMED"
     * }
     */
    public function updateStatus(): void
    {
        try {

            $authUser =
                $this->authUser();

            $data =
                $this->getRequestData();

            $orderId =
                $this->resolveId(
                    $data,
                    'order_id'
                );

            $status =
                trim(
                    (string) (
                        $data['status']
                        ?? ''
                    )
                );

            if ($status === '') {

                throw new RuntimeException(
                    'Status is required',
                    422
                );
            }

            $result =
                $this->orderService->updateOrderStatus(
                    $authUser,
                    $orderId,
                    $status
                );

            Response::success(
                $result,
                'Order status updated successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }
}

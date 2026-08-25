<?php

namespace App\Controllers;

use App\Services\OrderService;
use App\Core\Response;
use App\Core\Auth;
use RuntimeException;
use Throwable;

class OrderController
{
    private OrderService $orderService;

    public function __construct()
    {
        $this->orderService = new OrderService();
    }

    private function getRequestData(): array
    {
        $input = file_get_contents('php://input');

        if (!$input) {
            return [];
        }

        $data = json_decode($input, true);

        if (!is_array($data)) {
            return [];
        }

        return $data;
    }

    private function resolveId(array $data, string $key): int
    {
        $value = $_GET[$key] ?? $data[$key] ?? null;

        if (
            $value === null ||
            filter_var($value, FILTER_VALIDATE_INT) === false
        ) {
            throw new RuntimeException(
                "A valid {$key} is required",
                422
            );
        }

        return (int) $value;
    }

    private function statusFromException(Throwable $e): int
    {
        $code = $e->getCode();

        if (in_array($code, [401, 403, 404, 422], true)) {
            return $code;
        }

        return 400;
    }

    /**
     * تحويل السلة الحالية لأوردر/أوردرات (كاستومر بس)
     * POST /api/customer/orders/checkout  body: { "payment_method": "cash", "notes": "..." }
     */
    public function checkout(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $result = $this->orderService->checkout($authUser, $data);

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
     * كل أوردرات الكاستومر الحالي
     * GET /api/customer/orders
     */
    public function myOrders(): void
    {
        try {

            $authUser = Auth::user();

            $result = $this->orderService->listMyOrders($authUser);

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
     * عرض أوردر واحد (كاستومر صاحبه أو فيندور صاحب المحل)
     * GET /api/orders/show?order_id=1
     */
    public function show(): void
    {
        try {

            $authUser = Auth::user();

            $orderId = $this->resolveId([], 'order_id');

            $result = $this->orderService->showOrder($authUser, $orderId);

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

    /**
     * أوردرات محل معين (فيندور بس، ولازم يكون صاحب المحل)
     * GET /api/vendor/orders?store_id=1
     */
    public function storeOrders(): void
    {
        try {

            $authUser = Auth::user();

            $storeId = $this->resolveId([], 'store_id');

            $result = $this->orderService->listStoreOrders(
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
     * تحديث حالة أوردر (فيندور بس، ولازم الأوردر يكون تابع لمحله)
     * POST /api/vendor/orders/update-status  body: { "order_id": 1, "status": "SHIPPED" }
     */
    public function updateStatus(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $orderId = $this->resolveId($data, 'order_id');

            $status = $data['status'] ?? '';

            if (trim((string) $status) === '') {
                throw new RuntimeException(
                    'Status is required',
                    422
                );
            }

            $result = $this->orderService->updateOrderStatus(
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
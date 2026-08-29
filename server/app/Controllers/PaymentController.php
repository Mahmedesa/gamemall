<?php

namespace App\Controllers;

use App\Services\PaymentService;
use App\Core\Response;
use App\Core\Auth;
use RuntimeException;
use Throwable;

class PaymentController
{
    private PaymentService $paymentService;

    public function __construct()
    {
        $this->paymentService = new PaymentService();
    }

    /**
     * Get active payment methods
     *
     * GET /api/payment/methods
     */
    public function methods(): void
    {
        try {

            /*
             * Authentication
             */
            Auth::user();

            $methods =
                $this->paymentService
                    ->getActiveMethods();

            Response::success(
                $methods,
                'Payment methods retrieved successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * Get payment information for an order
     *
     * GET /api/payment/order?order_id=1
     */
    public function orderPayment(): void
    {
        try {

            $authUser =
                Auth::user();

            $orderId =
                $_GET['order_id'] ?? null;

            if (
                $orderId === null ||
                filter_var(
                    $orderId,
                    FILTER_VALIDATE_INT
                ) === false ||
                (int) $orderId <= 0
            ) {

                throw new RuntimeException(
                    'A valid order_id is required',
                    422
                );
            }

            $payment =
                $this->paymentService
                    ->getOrderPayment(
                        $authUser,
                        (int) $orderId
                    );

            if (!$payment) {

                Response::success(
                    [],
                    'No payment transaction found'
                );

                return;
            }

            Response::success(
                $payment,
                'Order payment retrieved successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * Get payment status
     *
     * GET /api/payment/status?order_id=1
     */
    public function status(): void
    {
        try {

            $authUser =
                Auth::user();

            $orderId =
                $_GET['order_id'] ?? null;

            if (
                $orderId === null ||
                filter_var(
                    $orderId,
                    FILTER_VALIDATE_INT
                ) === false ||
                (int) $orderId <= 0
            ) {

                throw new RuntimeException(
                    'A valid order_id is required',
                    422
                );
            }

            $result =
                $this->paymentService
                    ->getPaymentStatus(
                        $authUser,
                        (int) $orderId
                    );

            Response::success(
                $result,
                'Payment status retrieved successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * Change payment method
     *
     * POST /api/payment/change-method
     *
     * Body:
     * {
     *     "order_id": 1,
     *     "payment_method_id": 2
     * }
     */
    public function changeMethod(): void
    {
        try {

            $authUser =
                Auth::user();

            $data =
                $this->getRequestBody();

            /*
             * Validate order_id
             */
            $orderId =
                $data['order_id'] ?? null;

            if (
                $orderId === null ||
                filter_var(
                    $orderId,
                    FILTER_VALIDATE_INT
                ) === false ||
                (int) $orderId <= 0
            ) {

                throw new RuntimeException(
                    'order_id is required and must be a valid integer',
                    422
                );
            }

            /*
             * Validate payment_method_id
             */
            $paymentMethodId =
                $data['payment_method_id'] ?? null;

            if (
                $paymentMethodId === null ||
                filter_var(
                    $paymentMethodId,
                    FILTER_VALIDATE_INT
                ) === false ||
                (int) $paymentMethodId <= 0
            ) {

                throw new RuntimeException(
                    'payment_method_id is required and must be a valid integer',
                    422
                );
            }

            $result =
                $this->paymentService
                    ->changePaymentMethod(
                        $authUser,
                        (int) $orderId,
                        (int) $paymentMethodId
                    );

            Response::success(
                $result,
                'Payment method changed successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * Update payment status
     *
     * POST /api/payment/status
     *
     * Body:
     * {
     *     "order_id": 1,
     *     "status": "PAID"
     * }
     *
     * ملاحظة:
     * هنستخدمه لاحقًا من Payment Gateway Callback.
     */
    public function updateStatus(): void
    {
        try {

            $authUser =
                Auth::user();

            $data =
                $this->getRequestBody();

            /*
             * Validate order_id
             */
            $orderId =
                $data['order_id'] ?? null;

            if (
                $orderId === null ||
                filter_var(
                    $orderId,
                    FILTER_VALIDATE_INT
                ) === false ||
                (int) $orderId <= 0
            ) {

                throw new RuntimeException(
                    'order_id is required and must be a valid integer',
                    422
                );
            }

            /*
             * Validate status
             */
            $status =
                trim(
                    $data['status'] ?? ''
                );

            if ($status === '') {

                throw new RuntimeException(
                    'Payment status is required',
                    422
                );
            }

            $result =
                $this->paymentService
                    ->updatePaymentStatus(
                        $authUser,
                        (int) $orderId,
                        $status
                    );

            Response::success(
                $result,
                'Payment status updated successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * Read JSON request body
     */
    private function getRequestBody(): array
    {
        $input =
            file_get_contents(
                'php://input'
            );

        if (
            $input === false ||
            trim($input) === ''
        ) {

            throw new RuntimeException(
                'Request body is required',
                422
            );
        }

        $data =
            json_decode(
                $input,
                true
            );

        if (
            json_last_error() !==
            JSON_ERROR_NONE
        ) {

            throw new RuntimeException(
                'Invalid JSON request body',
                422
            );
        }

        if (!is_array($data)) {

            throw new RuntimeException(
                'Invalid JSON request body',
                422
            );
        }

        return $data;
    }

    /**
     * Convert exception code to HTTP status
     */
    private function statusFromException(
        Throwable $e
    ): int {

        $code =
            (int) $e->getCode();

        if (
            in_array(
                $code,
                [
                    400,
                    401,
                    403,
                    404,
                    409,
                    422,
                    500
                ],
                true
            )
        ) {

            return $code;
        }

        return 400;
    }
}


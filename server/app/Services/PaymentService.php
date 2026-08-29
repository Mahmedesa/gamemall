<?php

namespace App\Services;

use App\Core\Database;
use App\Models\PaymentMethod;
use App\Models\PaymentStatus;
use App\Models\PaymentTransaction;
use App\Models\Order;
use RuntimeException;

class PaymentService
{
    private PaymentMethod $paymentMethod;
    private PaymentStatus $paymentStatus;
    private PaymentTransaction $paymentTransaction;
    private Order $order;

    public function __construct()
    {
        $this->paymentMethod = new PaymentMethod();
        $this->paymentStatus = new PaymentStatus();
        $this->paymentTransaction = new PaymentTransaction();
        $this->order = new Order();
    }

    /**
     * Get active payment methods
     *
     * Master Data
     */
    public function getActiveMethods(): array
    {
        return $this->paymentMethod
            ->where(
                'is_active',
                '=',
                1
            )
            ->orderBy(
                'payment_method_id',
                'ASC'
            )
            ->get();
    }

    /**
     * Get payment for customer order
     */
    public function getOrderPayment(
        array $authUser,
        int $orderId
    ): ?array {

        $customerId =
            $this->currentCustomerId(
                $authUser
            );

        /*
         * Get Order
         */
        $order =
            $this->order->find(
                $orderId
            );

        if (!$order) {

            throw new RuntimeException(
                'Order not found',
                404
            );
        }

        /*
         * Ownership
         */
        if (
            (int) $order['customer_id']
            !==
            $customerId
        ) {

            throw new RuntimeException(
                'You are not authorized to view this payment',
                403
            );
        }

        /*
         * Get Payment Transaction
         */
        return $this->paymentTransaction
            ->where(
                'order_id',
                '=',
                $orderId
            )
            ->orderBy(
                'payment_transactions_id',
                'DESC'
            )
            ->first();
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus(
        array $authUser,
        int $orderId
    ): array {

        $payment =
            $this->getOrderPayment(
                $authUser,
                $orderId
            );

        if (!$payment) {

            throw new RuntimeException(
                'Payment transaction not found',
                404
            );
        }

        $status =
            $this->paymentStatus
                ->find(
                    $payment[
                        'payment_statuses_id'
                    ]
                );

        if (!$status) {

            throw new RuntimeException(
                'Payment status not found',
                404
            );
        }

        return [
            'payment' => $payment,
            'status' => $status
        ];
    }

    /**
     * Change payment status
     *
     * This will be used later by:
     *
     * - Cash on Delivery
     * - Online Payment Gateway
     * - Payment Callback
     * - Refund
     */
    public function updatePaymentStatus(
        array $authUser,
        int $orderId,
        string $statusCode
    ): array {

        $customerId =
            $this->currentCustomerId(
                $authUser
            );

        /*
         * Get Order
         */
        $order =
            $this->order->find(
                $orderId
            );

        if (!$order) {

            throw new RuntimeException(
                'Order not found',
                404
            );
        }

        /*
         * Check ownership
         */
        if (
            (int) $order['customer_id']
            !==
            $customerId
        ) {

            throw new RuntimeException(
                'You are not authorized to update this payment',
                403
            );
        }

        /*
         * Normalize status
         */
        $statusCode =
            strtoupper(
                trim($statusCode)
            );

        /*
         * Get Status
         */
        $status =
            $this->paymentStatus
                ->where(
                    'payment_status_code',
                    '=',
                    $statusCode
                )
                ->where(
                    'is_active',
                    '=',
                    1
                )
                ->first();

        if (!$status) {

            throw new RuntimeException(
                'Invalid or inactive payment status',
                422
            );
        }

        /*
         * Get existing transaction
         */
        $payment =
            $this->paymentTransaction
                ->where(
                    'order_id',
                    '=',
                    $orderId
                )
                ->orderBy(
                    'payment_transactions_id',
                    'DESC'
                )
                ->first();

        if (!$payment) {

            throw new RuntimeException(
                'Payment transaction not found',
                404
            );
        }

        /*
         * Update payment transaction
         */
        $updated =
            $this->paymentTransaction->update(
                $payment[
                    'payment_transactions_id'
                ],
                [
                    'payment_statuses_id' =>
                        $status[
                            'payment_statuses_id'
                        ]
                ]
            );

        if (!$updated) {

            throw new RuntimeException(
                'Failed to update payment status',
                500
            );
        }

        /*
         * Update order payment status
         *
         * Current DB contains payment_status
         * in shop_stores_orders.
         */
        $this->order->update(
            $orderId,
            [
                'payment_status' =>
                    $statusCode
            ]
        );

        /*
         * Return updated payment
         */
        return $this->paymentTransaction
            ->find(
                $payment[
                    'payment_transactions_id'
                ]
            ) ?? [];
    }

    /**
     * Change payment method
     *
     * Can be used before payment is completed.
     */
    public function changePaymentMethod(
        array $authUser,
        int $orderId,
        int $paymentMethodId
    ): array {

        $customerId =
            $this->currentCustomerId(
                $authUser
            );

        /*
         * Get Order
         */
        $order =
            $this->order->find(
                $orderId
            );

        if (!$order) {

            throw new RuntimeException(
                'Order not found',
                404
            );
        }

        /*
         * Ownership
         */
        if (
            (int) $order['customer_id']
            !==
            $customerId
        ) {

            throw new RuntimeException(
                'You are not authorized to change this payment method',
                403
            );
        }

        /*
         * Payment Method must be active
         */
        $method =
            $this->paymentMethod
                ->where(
                    'payment_method_id',
                    '=',
                    $paymentMethodId
                )
                ->where(
                    'is_active',
                    '=',
                    1
                )
                ->first();

        if (!$method) {

            throw new RuntimeException(
                'Payment method not found or inactive',
                422
            );
        }

        /*
         * Get payment transaction
         */
        $payment =
            $this->paymentTransaction
                ->where(
                    'order_id',
                    '=',
                    $orderId
                )
                ->orderBy(
                    'payment_transactions_id',
                    'DESC'
                )
                ->first();

        if (!$payment) {

            throw new RuntimeException(
                'Payment transaction not found',
                404
            );
        }

        /*
         * Don't allow changing method
         * after payment is completed.
         */
        $paidStatus =
            $this->paymentStatus
                ->where(
                    'payment_status_code',
                    '=',
                    'PAID'
                )
                ->first();

        if (
            $paidStatus &&
            (int) $payment[
                'payment_statuses_id'
            ]
            ===
            (int) $paidStatus[
                'payment_statuses_id'
            ]
        ) {

            throw new RuntimeException(
                'Payment method cannot be changed after payment is completed',
                422
            );
        }

        /*
         * Database transaction
         */
        $db =
            Database::connection();

        try {

            $db->beginTransaction();

            /*
             * Update payment transaction
             */
            $this->paymentTransaction->update(
                $payment[
                    'payment_transactions_id'
                ],
                [
                    'payment_method_id' =>
                        $paymentMethodId
                ]
            );

            /*
             * Update Order
             */
            $this->order->update(
                $orderId,
                [
                    'payment_method' =>
                        $paymentMethodId
                ]
            );

            $db->commit();

        } catch (\Throwable $e) {

            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $e;
        }

        return $this->paymentTransaction
            ->find(
                $payment[
                    'payment_transactions_id'
                ]
            ) ?? [];
    }

    /**
     * Get current customer ID
     */
    private function currentCustomerId(
        array $authUser
    ): int {

        /*
         * Direct customer_id
         */
        $customerId =
            $authUser['customer_id']
            ??
            $authUser['customer']['customer_id']
            ??
            null;

        if (
            $customerId === null ||
            filter_var(
                $customerId,
                FILTER_VALIDATE_INT
            ) === false
        ) {

            throw new RuntimeException(
                'Customer authentication is required',
                401
            );
        }

        return (int) $customerId;
    }
}


<?php

namespace App\Services;

use App\Services\PaymobService;
use App\Core\Database;
use App\Models\PaymentMethod;
use App\Models\PaymentStatus;
use App\Models\PaymentTransaction;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Currency;
use RuntimeException;

class PaymentService
{
    private PaymentMethod $paymentMethod;
    private PaymentStatus $paymentStatus;
    private PaymentTransaction $paymentTransaction;
    private Order $order;
    private Customer $customer;
    private Currency $currency;
    private ?PaymobService $paymob = null;

    public function __construct()
    {
        $this->paymentMethod = new PaymentMethod();
        $this->paymentStatus = new PaymentStatus();
        $this->paymentTransaction = new PaymentTransaction();
        $this->order = new Order();
        $this->customer = new Customer();
        $this->currency = new Currency();
    }

    /**
     * تهيئة PaymobService بس وقت الحاجة الفعلية ليها (lazy)،
     * عشان باقي دوال الكلاس (زي عرض طرق الدفع) متفشلش لو إعدادات
     * Paymob مش مظبوطة في الـ .env
     */
    private function paymob(): PaymobService
    {
        if ($this->paymob === null) {
            $this->paymob = new PaymobService();
        }

        return $this->paymob;
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

        $protectedStatuses = [
            'PAID',
            'FAILED',
            'REFUNDED',
            'CANCELLED',
        ];

        if (in_array($statusCode, $protectedStatuses, true)) {
            throw new RuntimeException(
                'This payment status cannot be changed manually',
                403
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
                    'payment_method_id' =>
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
     * Start Paymob payment for an existing order
     */
    public function startPaymobPayment(
        array $authUser,
        int $orderId
    ): array {

        $customerId = $this->currentCustomerId($authUser);

        /*
        * Get Order
        */
        $order = $this->order->find($orderId);

        if (!$order) {
            throw new RuntimeException(
                'Order not found',
                404
            );
        }

        /*
        * Check ownership
        */
        if ((int) $order['customer_id'] !== $customerId) {
            throw new RuntimeException(
                'You are not authorized to pay for this order',
                403
            );
        }

        /*
        * Get Customer
        */
        $customer = $this->customer->find($customerId);

        if (!$customer) {
            throw new RuntimeException(
                'Customer not found',
                404
            );
        }

        /*
        * Customer email is required by Paymob
        */
        $email = trim((string) ($customer['email'] ?? ''));

        if ($email === '') {
            throw new RuntimeException(
                'Customer email is required before starting payment',
                422
            );
        }

        /*
        * Get latest payment transaction
        */
        $payment = $this->paymentTransaction
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

        $paymentMethod = $this->paymentMethod
    ->where(
        'payment_method_id',
        '=',
        (int) ($payment['payment_method_id'] ?? 0)
    )
    ->where(
        'is_active',
        '=',
        1
    )
    ->first();

if (!$paymentMethod) {
    throw new RuntimeException(
        'Payment method not found or inactive',
        422
    );
}

$paymentCode = strtolower(
    trim(
        (string) ($paymentMethod['payment_code'] ?? '')
    )
);

if ($paymentCode !== 'paymob_card') {
    throw new RuntimeException(
        'This payment method is not configured for Paymob card payments',
        422
    );
}

        /*
        * Get currency
        */
        $currencyId = (int) (
            $payment['currency_type_id'] ?? 0
        );

        if ($currencyId <= 0) {
            throw new RuntimeException(
                'Payment currency is not configured',
                422
            );
        }

        $currency = $this->currency->find($currencyId);

        if (!$currency) {
            throw new RuntimeException(
                'Payment currency not found',
                422
            );
        }

        /*
        * Paymob expects the currency code
        */
        $currencyCode = strtoupper(
            trim(
                (string) (
                    $currency['currency_abbre']
                    ?? $currency['currency_abbrev']
                    ?? ''
                )
            )
        );

        if ($currencyCode === '') {
            throw new RuntimeException(
                'Currency code is not configured',
                422
            );
        }

        /*
        * Get payment amount
        */
        $total = (float) (
            $payment['total']
            ?? $order['total_amount']
            ?? 0
        );

        if ($total <= 0) {
            throw new RuntimeException(
                'Invalid payment amount',
                422
            );
        }

        /*
        * Paymob amount is sent in the smallest currency unit.
        *
        * Example:
        * 100.00 EGP => 10000
        */
        $amountCents = (int) round(
            $total * 100
        );

        /*
        * Customer information
        */
        $firstName = trim(
            (string) ($customer['first_name'] ?? '')
        );

        $lastName = trim(
            (string) ($customer['last_name'] ?? '')
        );

        $phone = trim(
            (string) ($customer['phone'] ?? '')
        );

        /*
        * Create Paymob Payment Intention
        */
        $intention = $this->paymob()->createIntention(
            $amountCents,
            $currencyCode,
            (string) $order['order_code'],
            $email,
            $firstName,
            $lastName,
            $phone
        );

        /*
        * Paymob returns client_secret for Unified Checkout
        */
        $clientSecret = trim(
            (string) (
                $intention['client_secret']
                ?? ''
            )
        );

        if ($clientSecret === '') {
            throw new RuntimeException(
                'Paymob did not return a client secret',
                502
            );
        }

        /*
        * Paymob intention information
        */
        $intentionOrderId = $intention['intention_order_id']
            ?? null;

        $intentionId = $intention['id']
            ?? null;

        /*
        * Save Paymob reference on our transaction
        */
        $transactionUpdate = [
            'gateway_name' => 'paymob'
        ];

        if ($intentionId !== null) {
            $transactionUpdate['gateway_transaction_id'] =
                (string) $intentionId;
        }

        if ($intentionOrderId !== null) {
            $transactionUpdate['transaction_reference'] =
                (string) $intentionOrderId;
        }

        $this->paymentTransaction->update(
            $payment['payment_transactions_id'],
            $transactionUpdate
        );

        /*
        * Create Unified Checkout URL
        */
        $checkoutUrl = $this->paymob()->getCheckoutUrl(
            $clientSecret
        );

        return [
            'order_id' => (int) $order['order_id'],
            'order_code' => $order['order_code'],

            'payment_transaction_id' =>
                (int) $payment['payment_transactions_id'],

            'amount' => round($total, 2),
            'currency' => $currencyCode,

            'gateway' => 'paymob',

            'intention_id' => $intentionId,
            'intention_order_id' => $intentionOrderId,

            'checkout_url' => $checkoutUrl
        ];
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

    /**
     * جلب حالة دفع بكودها (زي PAID أو FAILED) من جدول الحالات
     */
    private function getPaymentStatusByCode(string $code): array
    {
        $status = $this->paymentStatus
            ->where('payment_status_code', '=', $code)
            ->where('is_active', '=', 1)
            ->first();

        if (!$status) {
            throw new RuntimeException(
                "{$code} payment status is not configured",
                500
            );
        }

        return $status;
    }

    /**
     * معالجة الـ Webhook القادم من Paymob بعد ما العميل يخلّص
     * عملية الدفع (نجاح أو فشل). لازم يتحقق أولًا من الـ HMAC
     * قبل ما يصدّق أي بيانات جواه.
     *
     * POST /api/payment/paymob/webhook
     */
    public function handlePaymobWebhook(array $payload): void
    {
        /*
         * Paymob بيبعت بيانات المعاملة جوه "obj"، والتوقيع في "hmac"
         */
        $obj = $payload['obj'] ?? null;
        $receivedHmac = (string) ($payload['hmac'] ?? '');

        if (!is_array($obj)) {
            throw new RuntimeException(
                'Invalid webhook payload',
                422
            );
        }

        /*
         * التحقق من التوقيع - أهم خطوة أمان هنا، لو فشلت نرفض
         * الطلب فورًا وميتحدّثش أي حاجة في قاعدة البيانات
         */
        if (!$this->paymob()->verifyHmac($obj, $receivedHmac)) {
            throw new RuntimeException(
                'Invalid webhook signature',
                401
            );
        }

        /*
         * بس بنعالج TRANSACTION callbacks (مش TOKEN callbacks
         * الخاصة بحفظ الكروت)
         */
        $callbackType = (string) ($payload['type'] ?? '');

        if ($callbackType !== '' && $callbackType !== 'TRANSACTION') {
            return;
        }

        /*
         * special_reference اللي بعتناه وقت إنشاء الـ Intention
         * هو order_code بتاعنا، وده بيرجع في order.merchant_order_id
         * أو نستخدم order.id (Paymob's order id) اللي حفظناه إحنا
         * كـ transaction_reference وقت startPaymobPayment
         */
        $paymobOrderId = (string) ($obj['order']['id'] ?? '');

        if ($paymobOrderId === '') {
            throw new RuntimeException(
                'Missing order reference in webhook payload',
                422
            );
        }

        $payment = $this->paymentTransaction
            ->where('transaction_reference', '=', $paymobOrderId)
            ->orderBy('payment_transactions_id', 'DESC')
            ->first();

        if (!$payment) {
            throw new RuntimeException(
                'Payment transaction not found for this webhook',
                404
            );
        }

        /*
         * لو الأوردر ده اتعالج بالفعل قبل كده (Paymob بيبعت الـ
         * webhook أكتر من مرة أحيانًا)، منعملش حاجة تاني
         */
        $currentStatus = $this->paymentStatus->find(
            (int) $payment['payment_statuses_id']
        );

        if (
            $currentStatus &&
            in_array(
                $currentStatus['payment_status_code'],
                ['PAID', 'FAILED'],
                true
            )
        ) {
            return;
        }

        $success = (bool) ($obj['success'] ?? false);
        $pending = (bool) ($obj['pending'] ?? false);

        if ($pending) {
            return;
        }

        $newStatusCode = $success ? 'PAID' : 'FAILED';

        $newStatus = $this->getPaymentStatusByCode($newStatusCode);

        $this->paymentTransaction->update(
            (int) $payment['payment_transactions_id'],
            [
                'gateway_transaction_id' => (string) (
                    $obj['id'] ?? $payment['gateway_transaction_id']
                ),
                'payment_statuses_id' =>
                    $newStatus['payment_statuses_id']
            ]
        );

        /*
         * تحديث نسخة الحالة المختصرة على الأوردر نفسه كمان
         * (للعرض السريع بدون الحاجة تجيب PaymentTransaction كل مرة)
         */
        $this->order->update(
            (int) $payment['order_id'],
            [
                'payment_status' => $newStatusCode
            ]
        );
    }
}
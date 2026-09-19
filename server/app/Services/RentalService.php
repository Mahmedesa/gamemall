<?php

namespace App\Services;

use App\Models\Store;
use App\Models\VendorStoreRental;
use App\Models\ShopStoreVendorAssignment;
use App\Models\VendorStoreRentPayment;
use App\Models\Currency;
use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Services\PaymobService;
use RuntimeException;

class RentalService
{
    private Store $store;
    private VendorStoreRental $rental;
    private ShopStoreVendorAssignment $assignment;
    private VendorStoreRentPayment $rentPayment;
    private Currency $currency;
    private PaymentMethod $paymentMethod;
    private PaymentTransaction $paymentTransaction;
    private ?PaymobService $paymob = null;

    public function __construct()
    {
        $this->store = new Store();
        $this->rental = new VendorStoreRental();
        $this->assignment = new ShopStoreVendorAssignment();
        $this->rentPayment = new VendorStoreRentPayment();
        $this->currency = new Currency();
        $this->paymentMethod = new PaymentMethod();
        $this->paymentTransaction = new PaymentTransaction();
    }

    /**
     * Get stores available for rental
     */
    public function availableStores(): array
    {
        return $this->store
            ->where('is_active', '=', 1)
            ->where('store_status', '=', 'AVAILABLE')
            ->get();
    }

    /**
     * Get vendor rentals
     */
    public function myRentals(array $authUser): array
    {
        $vendorId = (int) ($authUser['vendor_id'] ?? 0);

        if ($vendorId <= 0) {
            throw new RuntimeException(
                'Vendor ID not found',
                401
            );
        }

        return $this->rental
            ->where(
                'Vendors_com_id',
                '=',
                $vendorId
            )
            ->orderBy(
                'rental_id',
                'DESC'
            )
            ->get();
    }

    /**
     * Create rental request
     *
     * Rental starts as PENDING.
     * First rent payment starts as UNPAID.
     *
     * Assignment is NOT created yet.
     * It will be created after successful payment.
     */
    public function createRental(
        array $authUser,
        array $data
    ): array {

        $vendorId = (int) ($authUser['vendor_id'] ?? 0);

        if ($vendorId <= 0) {
            throw new RuntimeException(
                'Vendor ID not found',
                401
            );
        }

        $storeId = (int) ($data['store_id'] ?? 0);

        if ($storeId <= 0) {
            throw new RuntimeException(
                'store_id is required',
                422
            );
        }

        $monthlyRent = (float) (
            $data['monthly_rent'] ?? 0
        );

        if ($monthlyRent <= 0) {
            throw new RuntimeException(
                'monthly_rent must be greater than 0',
                422
            );
        }

        $currencyId = (int) (
            $data['currency_type_id'] ?? 0
        );

        if ($currencyId <= 0) {
            throw new RuntimeException(
                'currency_type_id is required',
                422
            );
        }

        /*
         * Validate currency
         */
        $currency = $this->currency
            ->where(
                'currency_type_id',
                '=',
                $currencyId
            )
            ->first();

        if (!$currency) {
            throw new RuntimeException(
                'Currency not found',
                422
            );
        }

        /*
         * Validate store
         */
        $store = $this->store
            ->where(
                'store_id',
                '=',
                $storeId
            )
            ->where(
                'is_active',
                '=',
                1
            )
            ->first();

        if (!$store) {
            throw new RuntimeException(
                'Store not found or inactive',
                404
            );
        }

        /*
         * Store must be AVAILABLE
         */
        if (
            strtoupper(
                (string) ($store['store_status'] ?? '')
            ) !== 'AVAILABLE'
        ) {
            throw new RuntimeException(
                'Store is not available for rental',
                409
            );
        }

        /*
         * Check active assignment
         */
        $activeAssignment = $this->assignment
            ->where(
                'store_id',
                '=',
                $storeId
            )
            ->where(
                'assignment_status',
                '=',
                'ACTIVE'
            )
            ->first();

        if ($activeAssignment) {
            throw new RuntimeException(
                'Store is already assigned to another vendor',
                409
            );
        }

        /*
         * Check vendor does not already
         * have an active rental for this store
         */
        $pendingRental = $this->rental
            ->where(
                'Vendors_com_id',
                '=',
                $vendorId
            )
            ->where(
                'store_id',
                '=',
                $storeId
            )
            ->where(
                'rental_status',
                '=',
                'PENDING'
            )
            ->first();

        if ($pendingRental) {
            throw new RuntimeException(
                'Vendor already has a pending rental request for this store',
                409
            );
        }

        $existingRental = $this->rental
            ->where(
                'Vendors_com_id',
                '=',
                $vendorId
            )
            ->where(
                'store_id',
                '=',
                $storeId
            )
            ->where(
                'rental_status',
                '=',
                'ACTIVE'
            )
            ->first();

        if ($existingRental) {
            throw new RuntimeException(
                'Vendor already has an active rental for this store',
                409
            );
        }

        /*
         * Start date
         */
        $startDate = $data['start_date']
            ?? date('Y-m-d');

        /*
         * End date
         */
        $endDate = $data['end_date']
            ?? null;

        /*
         * Create rental as PENDING
         */
        $rentalCreated = $this->rental->create([
            'assignment_id' => null,

            'store_id' =>
                $storeId,

            'Vendors_com_id' =>
                $vendorId,

            'start_date' =>
                $startDate,

            'end_date' =>
                $endDate,

            'monthly_rent' =>
                $monthlyRent,

            'currency_type_id' =>
                $currencyId,

            'billing_cycle' =>
                'MONTHLY',

            'rental_status' =>
                'PENDING',
        ]);

        if (!$rentalCreated) {
            throw new RuntimeException(
                'Failed to create rental',
                500
            );
        }

        /*
         * Retrieve created rental
         */
        $rental = $this->rental
            ->where(
                'store_id',
                '=',
                $storeId
            )
            ->where(
                'Vendors_com_id',
                '=',
                $vendorId
            )
            ->where(
                'rental_status',
                '=',
                'PENDING'
            )
            ->orderBy(
                'rental_id',
                'DESC'
            )
            ->first();

        if (!$rental) {
            throw new RuntimeException(
                'Rental was created but could not be retrieved',
                500
            );
        }

        /*
         * First monthly billing period
         */
        $billingPeriod = date(
            'Y-m-01',
            strtotime($startDate)
        );

        /*
         * First payment due date
         */
        $dueDate = $startDate;

        /*
         * Create first rent payment
         */
        $paymentCreated = $this->rentPayment->create([
            'rental_id' =>
                (int) $rental['rental_id'],

            'billing_period' =>
                $billingPeriod,

            'due_date' =>
                $dueDate,

            'amount' =>
                $monthlyRent,

            'currency_type_id' =>
                $currencyId,

            'payment_status' =>
                'UNPAID',

            'payment_method_id' =>
                $data['payment_method_id'] ?? null,
        ]);

        if (!$paymentCreated) {
            throw new RuntimeException(
                'Failed to create first rent payment',
                500
            );
        }

        /*
         * Retrieve first payment
         */
        $payment = $this->rentPayment
            ->where(
                'rental_id',
                '=',
                (int) $rental['rental_id']
            )
            ->where(
                'billing_period',
                '=',
                $billingPeriod
            )
            ->first();

        if (!$payment) {
            throw new RuntimeException(
                'Rent payment was created but could not be retrieved',
                500
            );
        }

        return [
            'rental' => $rental,
            'first_payment' => $payment,
        ];
    }

    /**
     * Start Paymob payment for vendor store rental
     */
    public function startRentPaymobPayment(
        array $authUser,
        int $rentalId
    ): array {

        $vendorId = (int) ($authUser['vendor_id'] ?? 0);

        if ($vendorId <= 0) {
            throw new RuntimeException(
                'Vendor ID not found',
                401
            );
        }

        if ($rentalId <= 0) {
            throw new RuntimeException(
                'A valid rental_id is required',
                422
            );
        }

        /*
         * Get rental owned by current vendor
         */
        $rental = $this->rental
            ->where(
                'rental_id',
                '=',
                $rentalId
            )
            ->where(
                'Vendors_com_id',
                '=',
                $vendorId
            )
            ->first();

        if (!$rental) {
            throw new RuntimeException(
                'Rental not found',
                404
            );
        }

        /*
         * Rental must still be pending
         */
        if (
            strtoupper(
                (string) ($rental['rental_status'] ?? '')
            ) !== 'PENDING'
        ) {
            throw new RuntimeException(
                'Rental is not pending',
                409
            );
        }

        /*
         * Get first unpaid/pending rent payment
         */
        $payment = $this->rentPayment
            ->where(
                'rental_id',
                '=',
                $rentalId
            )
            ->where(
                'payment_status',
                '=',
                'UNPAID'
            )
            ->orderBy(
                'rent_payment_id',
                'DESC'
            )
            ->first();

        if (!$payment) {
            throw new RuntimeException(
                'No unpaid rent payment found',
                404
            );
        }

        /*
         * Payment method
         */
        $paymentMethodId = (int) (
            $payment['payment_method_id'] ?? 0
        );

        if ($paymentMethodId <= 0) {
            throw new RuntimeException(
                'Payment method is required',
                422
            );
        }

        $paymentMethod = $this->paymentMethod
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

        if (!$paymentMethod) {
            throw new RuntimeException(
                'Payment method not found or inactive',
                422
            );
        }

        /*
         * Only Paymob Card for now
         */
        $paymentCode = strtolower(
            trim(
                (string) (
                    $paymentMethod['payment_code'] ?? ''
                )
            )
        );

        if ($paymentCode !== 'paymob_card') {
            throw new RuntimeException(
                'This payment method is not configured for Paymob card payments',
                422
            );
        }

        /*
         * Currency
         */
        $currencyId = (int) (
            $payment['currency_type_id'] ?? 0
        );

        $currency = $this->currency
            ->where(
                'currency_type_id',
                '=',
                $currencyId
            )
            ->first();

        if (!$currency) {
            throw new RuntimeException(
                'Currency not found',
                422
            );
        }

        $currencyCode = strtoupper(
            trim(
                (string) (
                    $currency['currency_abbre']
                    ?? $currency['currency_abbrev']
                    ?? ''
                )
            )
        );

        /*
         * Current Paymob integration
         * works with EGP
         */
        if ($currencyCode !== 'EGP') {
            throw new RuntimeException(
                'Paymob rental payments currently require EGP',
                422
            );
        }

        /*
         * Amount
         */
        $amount = (float) (
            $payment['amount'] ?? 0
        );

        if ($amount <= 0) {
            throw new RuntimeException(
                'Invalid rent payment amount',
                422
            );
        }

        $amountCents = (int) round(
            $amount * 100
        );

        /*
         * Create Paymob service
         */
        if ($this->paymob === null) {
            $this->paymob = new PaymobService();
        }

        /*
         * Merchant reference (Unique for each attempt)
         */
        $merchantReference = sprintf(
            'RENT-%06d-%06d-%s',
            (int) $rentalId,
            (int) $payment['rent_payment_id'],
            strtoupper(bin2hex(random_bytes(4)))
        );

        /*
         * Customer/vendor data
         *
         * We use available auth data.
         */
        $email = trim(
            (string) (
                $authUser['email'] ?? ''
            )
        );

        if ($email === '') {
            throw new RuntimeException(
                'Vendor email is required for Paymob payment',
                422
            );
        }

        $name = trim(
            (string) (
                $authUser['name']
                ?? $authUser['username']
                ?? 'Vendor'
            )
        );

        $nameParts = preg_split(
            '/\s+/',
            $name
        );

        $firstName =
            $nameParts[0] ?? 'Vendor';

        $lastName =
            count($nameParts) > 1
                ? implode(
                    ' ',
                    array_slice(
                        $nameParts,
                        1
                    )
                )
                : 'Vendor';

        $phone = trim(
            (string) (
                $authUser['phone'] ?? ''
            )
        );

        /*
         * Create Paymob intention
         */
        $paymobResponse =
            $this->paymob->createIntention(
                $amountCents,
                'EGP',
                $merchantReference,
                $email,
                $firstName,
                $lastName,
                $phone
            );

        /*
         * Extract Intention Details Correctly from Paymob v1 Response
         */
        $intentionId      = $paymobResponse['id'] ?? null;
        $clientSecret     = $paymobResponse['client_secret'] ?? null;
        $intentionOrderId = $paymobResponse['intention_order_id'] ?? ($paymobResponse['order']['id'] ?? null);

        /*
         * Build Unified Checkout URL
         */
        $checkoutUrl = null;
        if ($clientSecret) {
            $checkoutUrl = $this->paymob->getCheckoutUrl($clientSecret);
        }

        /*
         * Save gateway information
         */
        $this->rentPayment->update(
            (int) $payment['rent_payment_id'],
            [
                'payment_status' =>
                    'PENDING',

                'gateway_name' =>
                    'paymob',

                'gateway_transaction_id' =>
                    (string) ($intentionId ?? ''),

                'transaction_reference' =>
                    (string) ($intentionOrderId ?? ''),
            ]
        );

        /*
         * Get updated payment
         */
        $updatedPayment =
            $this->rentPayment
                ->find(
                    (int) $payment['rent_payment_id']
                );

        return [
            'rental_id' =>
                (int) $rental['rental_id'],

            'rent_payment_id' =>
                (int) $payment['rent_payment_id'],

            'amount' =>
                $amount,

            'currency' =>
                'EGP',

            'gateway' =>
                'paymob',

            'intention_id' =>
                $intentionId,

            'intention_order_id' =>
                $intentionOrderId,

            'checkout_url' =>
                $checkoutUrl,

            'payment' =>
                $updatedPayment,
        ];
    }
    /**
     * Mark rent payment as PAID and ACTIVATE the rental and store assignment
     */
    public function markRentPaymentAsPaidByOrderId(string $orderId, string $transactionId): bool
    {
        // 1. البحث عن عملية الدفع باستخدامه الـ transaction_reference (الذي يخزن order_id)
        $payment = $this->rentPayment
            ->where('transaction_reference', '=', $orderId)
            ->first();

        if (!$payment) {
            throw new RuntimeException("Rent payment with reference {$orderId} not found");
        }

        // إذا كانت الدفعة مدفوعة بالفعل، لا داعي لإعادة المعالجة
        if (strtoupper((string) ($payment['payment_status'] ?? '')) === 'PAID') {
            return true;
        }

        // 2. تحديث حالة الدفعة إلى PAID
        $this->rentPayment->update(
            (int) $payment['rent_payment_id'],
            [
                'payment_status'         => 'PAID',
                'gateway_transaction_id' => $transactionId,
                'paid_at'                => date('Y-m-d H:i:s'),
            ]
        );

        $rentalId = (int) $payment['rental_id'];
        $rental   = $this->rental->find($rentalId);

        if (!$rental) {
            throw new RuntimeException("Rental record {$rentalId} not found");
        }

        // 3. إنشاء أو تفعيل الـ Shop/Store Vendor Assignment
        $assignment = $this->assignment
            ->where('store_id', '=', (int) $rental['store_id'])
            ->where('Vendors_com_id', '=', (int) $rental['Vendors_com_id'])
            ->where('assignment_status', '=', 'ACTIVE')
            ->first();

        if (!$assignment) {
            $assignmentCreated = $this->assignment->create([
                'store_id'          => (int) $rental['store_id'],
                'Vendors_com_id'    => (int) $rental['Vendors_com_id'],
                'assignment_status' => 'ACTIVE',
                'assigned_at'       => date('Y-m-d H:i:s'),
            ]);

            if (!$assignmentCreated) {
                throw new RuntimeException("Failed to create store assignment");
            }

            // استرجاع الـ Assignment الجديد للربط
            $assignment = $this->assignment
                ->where('store_id', '=', (int) $rental['store_id'])
                ->where('Vendors_com_id', '=', (int) $rental['Vendors_com_id'])
                ->where('assignment_status', '=', 'ACTIVE')
                ->first();
        }

        // 4. تحديث الـ Rental إلى ACTIVE وتمرير الـ assignment_id
        $this->rental->update(
            $rentalId,
            [
                'rental_status' => 'ACTIVE',
                'assignment_id' => $assignment['assignment_id'] ?? null,
            ]
        );

        // 5. تحديث حالة الـ Store نفسه إلى OCCUPIED / RENTED
        $this->store->update(
            (int) $rental['store_id'],
            [
                'store_status' => 'RENTED',
            ]
        );

        return true;
    }

    /**
     * Mark rent payment as FAILED
     */
    public function markRentPaymentAsFailedByOrderId(string $orderId, string $transactionId): bool
    {
        $payment = $this->rentPayment
            ->where('transaction_reference', '=', $orderId)
            ->first();

        if (!$payment) {
            return false;
        }

        return $this->rentPayment->update(
            (int) $payment['rent_payment_id'],
            [
                'payment_status'         => 'FAILED',
                'gateway_transaction_id' => $transactionId,
            ]
        );
    }
}
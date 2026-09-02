<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\CustomerAddress;
use App\Models\PaymentMethod;
use App\Models\PaymentStatus;
use App\Models\PaymentTransaction;
use App\Models\Currency;
use App\Core\Database;
use RuntimeException;

class OrderService
{
    private Cart $cart;
    private CartItem $cartItem;
    private Order $order;
    private OrderItem $orderItem;
    private Product $product;
    private Store $store;
    private CustomerAddress $customerAddress;
    private Currency $currency;
    private PaymentMethod $paymentMethod;
    private PaymentStatus $paymentStatus;
    private PaymentTransaction $paymentTransaction;

    /*
    |--------------------------------------------------------------------------
    | Order Statuses
    |--------------------------------------------------------------------------
    */

    private const ALLOWED_STATUSES = [
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED'
    ];

    /*
    |--------------------------------------------------------------------------
    | Allowed Status Transitions
    |--------------------------------------------------------------------------
    |
    | PENDING
    |    ├──> CONFIRMED
    |    └──> CANCELLED
    |
    | CONFIRMED
    |    ├──> PROCESSING
    |    └──> CANCELLED
    |
    | PROCESSING
    |    ├──> SHIPPED
    |    └──> CANCELLED
    |
    | SHIPPED
    |    └──> DELIVERED
    |
    | DELIVERED  -> no changes
    | CANCELLED  -> no changes
    |
    */

    private const STATUS_TRANSITIONS = [
        'PENDING' => [
            'CONFIRMED',
            'CANCELLED'
        ],

        'CONFIRMED' => [
            'PROCESSING',
            'CANCELLED'
        ],

        'PROCESSING' => [
            'SHIPPED',
            'CANCELLED'
        ],

        'SHIPPED' => [
            'DELIVERED'
        ],

        'DELIVERED' => [],

        'CANCELLED' => []
    ];

    public function __construct()
    {
        $this->cart = new Cart();
        $this->cartItem = new CartItem();
        $this->order = new Order();
        $this->orderItem = new OrderItem();
        $this->product = new Product();
        $this->store = new Store();
        $this->customerAddress = new CustomerAddress();
        $this->currency = new Currency();
        $this->paymentMethod = new PaymentMethod();
        $this->paymentStatus = new PaymentStatus();
        $this->paymentTransaction = new PaymentTransaction();
    }

    /*
    |--------------------------------------------------------------------------
    | Current Customer
    |--------------------------------------------------------------------------
    */

    private function currentCustomerId(array $authUser): int
    {
        if (($authUser['account_type'] ?? null) !== 'customer') {
            throw new RuntimeException(
                'Only customer accounts can place orders',
                403
            );
        }

        $customerId = $authUser['customer_id'] ?? null;

        if (!$customerId) {
            throw new RuntimeException(
                'Customer account is not linked properly',
                403
            );
        }

        return (int) $customerId;
    }

    /*
    |--------------------------------------------------------------------------
    | Current Vendor
    |--------------------------------------------------------------------------
    */

    private function currentVendorId(array $authUser): int
    {
        if (($authUser['account_type'] ?? null) !== 'vendor') {
            throw new RuntimeException(
                'Only vendor accounts can manage store orders',
                403
            );
        }

        $vendorId = $authUser['vendor_id'] ?? null;

        if (!$vendorId) {
            throw new RuntimeException(
                'Vendor account is not linked to a company',
                403
            );
        }

        return (int) $vendorId;
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Order Code
    |--------------------------------------------------------------------------
    */

    private function generateOrderCode(): string
    {
        do {
            $code =
                'ORD-' .
                date('Ymd') .
                '-' .
                strtoupper(
                    bin2hex(random_bytes(4))
                );

            $exists = $this->order
                ->where(
                    'order_code',
                    '=',
                    $code
                )
                ->exists();

        } while ($exists);

        return $code;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Payment Method
    |--------------------------------------------------------------------------
    */

    private function validatePaymentMethod(
        int $paymentMethodId
    ): array {
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

        return $paymentMethod;
    }

    /*
    |--------------------------------------------------------------------------
    | Get UNPAID Payment Status
    |--------------------------------------------------------------------------
    */

    private function getUnpaidPaymentStatus(): array
    {
        $status = $this->paymentStatus
            ->where(
                'payment_status_code',
                '=',
                'UNPAID'
            )
            ->where(
                'is_active',
                '=',
                1
            )
            ->first();

        if (!$status) {
            throw new RuntimeException(
                'UNPAID payment status is not configured',
                500
            );
        }

        return $status;
    }

    /*
    |--------------------------------------------------------------------------
    | Checkout
    |--------------------------------------------------------------------------
    */

    public function checkout(
        array $authUser,
        array $data
    ): array {

        $customerId =
            $this->currentCustomerId($authUser);

        /*
        |--------------------------------------------------------------------------
        | Get Cart
        |--------------------------------------------------------------------------
        */

        $cart = $this->cart
            ->where(
                'cus_id',
                '=',
                $customerId
            )
            ->first();

        if (!$cart) {
            throw new RuntimeException(
                'Cart is empty',
                422
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Get Cart Items
        |--------------------------------------------------------------------------
        */

        $items = $this->cartItem
            ->where(
                'carts_id',
                '=',
                $cart['carts_id']
            )
            ->get();

        if (empty($items)) {
            throw new RuntimeException(
                'Cart is empty',
                422
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Address
        |--------------------------------------------------------------------------
        */

        $addressId =
            $data['address_id'] ?? null;

        if (
            $addressId === null ||
            filter_var(
                $addressId,
                FILTER_VALIDATE_INT
            ) === false
        ) {
            throw new RuntimeException(
                'A valid address_id is required for checkout',
                422
            );
        }

        $addressId = (int) $addressId;

        $address = $this->customerAddress
            ->find($addressId);

        if (
            !$address ||
            (int) $address['cus_id'] !== $customerId
        ) {
            throw new RuntimeException(
                'Address not found or does not belong to you',
                422
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Payment Method
        |--------------------------------------------------------------------------
        */

        $paymentMethodId =
            $data['payment_method_id'] ?? null;

        if (
            $paymentMethodId === null ||
            filter_var(
                $paymentMethodId,
                FILTER_VALIDATE_INT
            ) === false
        ) {
            throw new RuntimeException(
                'A valid payment_method_id is required',
                422
            );
        }

        $paymentMethodId =
            (int) $paymentMethodId;

        $this->validatePaymentMethod(
            $paymentMethodId
        );

        $currencyTypeId = (int)($data['currency_type_id'] ?? 0);

        if ($currencyTypeId <= 0) {
            throw new RuntimeException('Currency is required', 422);
        }

        $currency = $this->currency->find($currencyTypeId);

        if (!$currency) {
            throw new RuntimeException('Invalid currency', 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Get UNPAID Status
        |--------------------------------------------------------------------------
        */

        $unpaidStatus =
            $this->getUnpaidPaymentStatus();

        /*
        |--------------------------------------------------------------------------
        | Group Items By Store
        |--------------------------------------------------------------------------
        */

        $itemsByStore = [];

        foreach ($items as $item) {
            $itemsByStore[
                (int) $item['store_id']
            ][] = $item;
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Stock
        |--------------------------------------------------------------------------
        */

        $productsCache = [];
        $requestedPerProduct = [];

        foreach ($items as $item) {

            $productId =
                (int) $item['product_id'];

            if (
                !isset(
                    $productsCache[$productId]
                )
            ) {
                $productsCache[$productId] =
                    $this->product->find(
                        $productId
                    );
            }

            if (
                !isset(
                    $requestedPerProduct[$productId]
                )
            ) {
                $requestedPerProduct[$productId] = 0;
            }

            $requestedPerProduct[$productId] +=
                (int) $item['Quantity'];
        }

        foreach (
            $requestedPerProduct
            as $productId => $requested
        ) {

            $product =
                $productsCache[$productId];

            if (!$product) {
                throw new RuntimeException(
                    'One of the products in your cart no longer exists',
                    422
                );
            }

            $available =
                (int) (
                    $product['stock_quantity']
                    ?? 0
                );

            if ($available < $requested) {

                $productName =
                    $product['product_name_en']
                    ??
                    $product['product_name_ar']
                    ??
                    ('#' . $productId);

                throw new RuntimeException(
                    "Not enough stock for \"{$productName}\". " .
                    "Available: {$available}, requested: {$requested}",
                    422
                );
            }
        }

        $notes =
            $data['notes'] ?? null;

        $db = Database::connection();

        try {

            /*
            |--------------------------------------------------------------------------
            | Begin Transaction
            |--------------------------------------------------------------------------
            */

            $db->beginTransaction();

            $createdOrders = [];

            /*
            |--------------------------------------------------------------------------
            | Create Order For Each Store
            |--------------------------------------------------------------------------
            */

            foreach (
                $itemsByStore
                as $storeId => $storeItems
            ) {

                $subtotal = 0;

                foreach (
                    $storeItems
                    as $storeItem
                ) {

                    $subtotal +=
                        (float) (
                            $storeItem['total']
                            ?? 0
                        );
                }

                $subtotal =
                    round($subtotal, 2);

                /*
                |--------------------------------------------------------------------------
                | Order Code
                |--------------------------------------------------------------------------
                */

                $orderCode =
                    $this->generateOrderCode();

                /*
                |--------------------------------------------------------------------------
                | Create Order
                |--------------------------------------------------------------------------
                */

                $created = $this->order->create([
                    'order_code' =>
                        $orderCode,

                    'store_id' =>
                        $storeId,

                    'customer_id' =>
                        $customerId,

                    'cus_address_id' =>
                        $addressId,

                    'order_status' =>
                        'PENDING',

                    'payment_status' =>
                        'UNPAID',

                    'payment_method_id' =>
                        $paymentMethodId,

                    'subtotal' =>
                        $subtotal,

                    'discount_amount' =>
                        0,

                    'tax_amount' =>
                        0,

                    'shipping_amount' =>
                        0,

                    'total_amount' =>
                        $subtotal,

                    'notes' =>
                        $notes,

                    'created_by' =>
                        $authUser['auth_id']
                        ?? null
                ]);

                if (!$created) {
                    throw new RuntimeException(
                        'Failed to create order',
                        500
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Get Order ID
                |--------------------------------------------------------------------------
                */

                $orderId =
                    (int) $db->lastInsertId();

                /*
                |--------------------------------------------------------------------------
                | Create Payment Transaction
                |--------------------------------------------------------------------------
                */

                $paymentCreated =
                    $this->paymentTransaction->create([
                        'order_id' =>
                            $orderId,

                        'payment_method_id' =>
                            $paymentMethodId,

                        'payment_statuses_id' =>
                            $unpaidStatus[
                                'payment_statuses_id'
                            ],

                        'total' =>
                            $subtotal,

                        'currency_type_id' => 
                            $currencyTypeId
                    ]);

                if (!$paymentCreated) {
                    throw new RuntimeException(
                        'Failed to create payment transaction',
                        500
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Create Order Items
                |--------------------------------------------------------------------------
                */

                foreach (
                    $storeItems
                    as $storeItem
                ) {

                    $productId =
                        (int) $storeItem['product_id'];

                    $product =
                        $productsCache[$productId];

                    $this->orderItem->create([
                        'order_id' =>
                            $orderId,

                        'product_id' =>
                            $productId,

                        'product_name_ar' =>
                            $product[
                                'product_name_ar'
                            ] ?? null,

                        'product_name_en' =>
                            $product[
                                'product_name_en'
                            ] ?? null,

                        'quantity' =>
                            $storeItem['Quantity'],

                        'unit_price' =>
                            $storeItem[
                                'product_Cost'
                            ],

                        'discount_amount' =>
                            0,

                        'tax_amount' =>
                            0,

                        'total_amount' =>
                            $storeItem['total']
                    ]);


                    $currentStock =
                        (int) (
                            $product['stock_quantity'] ?? 0
                        );

                    $quantity =
                        (int) $storeItem['Quantity'];

                    if ($quantity <= 0) {
                        throw new RuntimeException(
                            'Invalid product quantity',
                            400
                        );
                    }

                    if ($quantity > $currentStock) {
                        throw new RuntimeException(
                            'Insufficient stock for product ID: ' . $productId,
                            400
                        );
                    }

                    $newStock =
                        $currentStock - $quantity;

                    $this->product->update( 
                        $productId, 
                        [ 
                            'stock_quantity' => 
                                $newStock 
                        ] 
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Update Product Cache
                    |--------------------------------------------------------------------------
                    */

                    $productsCache[
                        $productId
                    ]['stock_quantity'] =
                        $newStock;
                }

                /*
                |--------------------------------------------------------------------------
                | Add Order To Response
                |--------------------------------------------------------------------------
                */

                $createdOrders[] =
                    $this->order->find(
                        $orderId
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Clear Cart
            |--------------------------------------------------------------------------
            */

            foreach ($items as $item) {

                $this->cartItem->delete(
                    $item['cart_items_id']
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Commit
            |--------------------------------------------------------------------------
            */

            $db->commit();

            return $createdOrders;

        } catch (\Throwable $e) {

            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $e;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Customer Orders
    |--------------------------------------------------------------------------
    */

    public function listMyOrders(
        array $authUser
    ): array {

        $customerId =
            $this->currentCustomerId(
                $authUser
            );

        return $this->order
            ->where(
                'customer_id',
                '=',
                $customerId
            )
            ->orderBy(
                'created_at',
                'DESC'
            )
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Show Order
    |--------------------------------------------------------------------------
    */

    public function showOrder(
        array $authUser,
        int $orderId
    ): array {

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

        $accountType =
            $authUser['account_type']
            ?? null;

        /*
        |--------------------------------------------------------------------------
        | Customer
        |--------------------------------------------------------------------------
        */

        if ($accountType === 'customer') {

            $customerId =
                $this->currentCustomerId(
                    $authUser
                );

            if (
                (int) $order['customer_id']
                !==
                $customerId
            ) {
                throw new RuntimeException(
                    'You are not authorized to view this order',
                    403
                );
            }

        /*
        |--------------------------------------------------------------------------
        | Vendor
        |--------------------------------------------------------------------------
        */

        } elseif ($accountType === 'vendor') {

            $vendorId =
                $this->currentVendorId(
                    $authUser
                );

            $store =
                $this->store->find(
                    (int) $order['store_id']
                );

            if (
                !$store ||
                (int) $store['Vendors_com_id']
                !==
                $vendorId
            ) {
                throw new RuntimeException(
                    'You are not authorized to view this order',
                    403
                );
            }

        } else {

            throw new RuntimeException(
                'Not authorized',
                403
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Order Items
        |--------------------------------------------------------------------------
        */

        $order['items'] =
            $this->orderItem
                ->where(
                    'order_id',
                    '=',
                    $orderId
                )
                ->get();

        return $order;
    }

    /*
    |--------------------------------------------------------------------------
    | Store Orders
    |--------------------------------------------------------------------------
    */

    public function listStoreOrders(
        array $authUser,
        int $storeId
    ): array {

        $vendorId =
            $this->currentVendorId(
                $authUser
            );

        $store =
            $this->store->find(
                $storeId
            );

        if (!$store) {
            throw new RuntimeException(
                'Store not found',
                404
            );
        }

        if (
            (int) $store['Vendors_com_id']
            !==
            $vendorId
        ) {
            throw new RuntimeException(
                'You are not authorized to view this store orders',
                403
            );
        }

        return $this->order
            ->where(
                'store_id',
                '=',
                $storeId
            )
            ->orderBy(
                'created_at',
                'DESC'
            )
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Update Order Status
    |--------------------------------------------------------------------------
    */

    public function updateOrderStatus(
        array $authUser,
        int $orderId,
        string $status
    ): array {

        /*
        |--------------------------------------------------------------------------
        | Current Vendor
        |--------------------------------------------------------------------------
        */

        $vendorId =
            $this->currentVendorId(
                $authUser
            );

        /*
        |--------------------------------------------------------------------------
        | Normalize New Status
        |--------------------------------------------------------------------------
        */

        $status =
            strtoupper(
                trim($status)
            );

        /*
        |--------------------------------------------------------------------------
        | Validate Status
        |--------------------------------------------------------------------------
        */

        if (
            !in_array(
                $status,
                self::ALLOWED_STATUSES,
                true
            )
        ) {
            throw new RuntimeException(
                'Invalid order status. Allowed: ' .
                implode(
                    ', ',
                    self::ALLOWED_STATUSES
                ),
                422
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Get Order
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Current Status
        |--------------------------------------------------------------------------
        */

        $currentStatus =
            strtoupper(
                trim(
                    $order['order_status']
                    ?? ''
                )
            );

        /*
        |--------------------------------------------------------------------------
        | Same Status
        |--------------------------------------------------------------------------
        */

        if ($currentStatus === $status) {
            throw new RuntimeException(
                'Order already has this status',
                422
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Transition
        |--------------------------------------------------------------------------
        */

        $allowedNextStatuses =
            self::STATUS_TRANSITIONS[
                $currentStatus
            ] ?? [];

        if (
            !in_array(
                $status,
                $allowedNextStatuses,
                true
            )
        ) {
            throw new RuntimeException(
                "Cannot change order status from {$currentStatus} to {$status}",
                422
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Store Ownership
        |--------------------------------------------------------------------------
        */

        $store =
            $this->store->find(
                (int) $order['store_id']
            );

        if (
            !$store ||
            (int) $store['Vendors_com_id']
            !==
            $vendorId
        ) {
            throw new RuntimeException(
                'You are not authorized to update this order',
                403
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Cancellation
        |--------------------------------------------------------------------------
        |
        | Return Stock
        |
        */

        if (
            $status === 'CANCELLED' &&
            $currentStatus !== 'CANCELLED'
        ) {

            $orderItems =
                $this->orderItem
                    ->where(
                        'order_id',
                        '=',
                        $orderId
                    )
                    ->get();

            foreach (
                $orderItems
                as $orderItem
            ) {

                $product =
                    $this->product->find(
                        (int) $orderItem[
                            'product_id'
                        ]
                    );

                if ($product) {

                    $restoredStock =
                        (int) (
                            $product[
                                'stock_quantity'
                            ] ?? 0
                        )
                        +
                        (int) $orderItem[
                            'quantity'
                        ];

                    $this->product->update(
                        (int) $orderItem[
                            'product_id'
                        ],
                        [
                            'stock_quantity' =>
                                $restoredStock
                        ]
                    );
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Update Order Status
        |--------------------------------------------------------------------------
        */

        $this->order->update(
            $orderId,
            [
                'order_status' =>
                    $status
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Return Updated Order
        |--------------------------------------------------------------------------
        */

        return $this->order->find(
            $orderId
        );
    }
}


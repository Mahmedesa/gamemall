<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\CustomerAddress;
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

    /**
     * الحالات المسموح بيها لأوردر (لا يوجد FK مباشر في الداتا بيز،
     * فبنتحقق منها هنا يدويًا)
     */
    private const ALLOWED_STATUSES = [
        'PENDING',
        'CONFIRMED',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED'
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
    }

    /**
     * التأكد إن الحساب الحالي "customer" وإرجاع الـ cus_id بتاعه
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

    /**
     * التأكد إن الحساب الحالي "vendor" وإرجاع الـ Vendors_com_id بتاعه
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

    /**
     * كود أوردر فريد
     */
    private function generateOrderCode(): string
    {
        do {

            $code = 'ORD-' .
                date('Ymd') .
                '-' .
                strtoupper(bin2hex(random_bytes(4)));

            $exists = $this->order
                ->where('order_code', '=', $code)
                ->exists();

        } while ($exists);

        return $code;
    }

    /**
     * تحويل السلة الحالية لأوردر واحد أو أكثر (أوردر منفصل لكل محل)
     */
    public function checkout(array $authUser, array $data): array
    {
        $customerId = $this->currentCustomerId($authUser);

        $cart = $this->cart
            ->where('cus_id', '=', $customerId)
            ->first();

        if (!$cart) {
            throw new RuntimeException(
                'Cart is empty',
                422
            );
        }

        $items = $this->cartItem
            ->where('carts_id', '=', $cart['carts_id'])
            ->get();

        if (empty($items)) {
            throw new RuntimeException(
                'Cart is empty',
                422
            );
        }

        /*
         * العنوان مطلوب وقت الـ checkout، ولازم يكون ملك الكاستومر الحالي
         */
        $addressId = $data['address_id'] ?? null;

        if (
            $addressId === null ||
            filter_var($addressId, FILTER_VALIDATE_INT) === false
        ) {
            throw new RuntimeException(
                'A valid address_id is required for checkout',
                422
            );
        }

        $addressId = (int) $addressId;

        $address = $this->customerAddress->find($addressId);

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
         * تقسيم عناصر السلة حسب المحل - كل محل هياخد أوردر مستقل
         */
        $itemsByStore = [];

        foreach ($items as $item) {
            $itemsByStore[(int) $item['store_id']][] = $item;
        }

        /*
         * التأكد إن كل منتج في السلة متوفر بالكمية المطلوبة قبل ما نكمل.
         * بنجمع الكمية المطلوبة لكل منتج (حتى لو ظهر أكتر من مرة بألوان
         * مختلفة) عشان نقارنها صح بالمخزون المتاح مرة واحدة.
         */
        $productsCache = [];
        $requestedPerProduct = [];

        foreach ($items as $item) {

            $productId = (int) $item['product_id'];

            if (!isset($productsCache[$productId])) {
                $productsCache[$productId] =
                    $this->product->find($productId);
            }

            if (!isset($requestedPerProduct[$productId])) {
                $requestedPerProduct[$productId] = 0;
            }

            $requestedPerProduct[$productId] += (int) $item['Quantity'];
        }

        foreach ($requestedPerProduct as $productId => $requested) {

            $product = $productsCache[$productId];

            if (!$product) {
                throw new RuntimeException(
                    'One of the products in your cart no longer exists',
                    422
                );
            }

            $available = (int) ($product['stock_quantity'] ?? 0);

            if ($available < $requested) {

                $productName =
                    $product['product_name_en'] ??
                    $product['product_name_ar'] ??
                    ('#' . $productId);

                throw new RuntimeException(
                    "Not enough stock for \"{$productName}\". " .
                        "Available: {$available}, requested: {$requested}",
                    422
                );
            }
        }

        $paymentMethod = $data['payment_method'] ?? null;
        $notes = $data['notes'] ?? null;

        $db = Database::connection();

        try {

            $db->beginTransaction();

            $createdOrders = [];

            foreach ($itemsByStore as $storeId => $storeItems) {

                $subtotal = 0;

                foreach ($storeItems as $storeItem) {
                    $subtotal += (float) ($storeItem['total'] ?? 0);
                }

                $orderCode = $this->generateOrderCode();

                $this->order->create([
                    'order_code' => $orderCode,
                    'store_id' => $storeId,
                    'customer_id' => $customerId,
                    'cus_address_id' => $addressId,
                    'order_status' => 'PENDING',
                    'payment_status' => 'UNPAID',
                    'payment_method' => $paymentMethod,
                    'subtotal' => round($subtotal, 2),
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'shipping_amount' => 0,
                    'total_amount' => round($subtotal, 2),
                    'notes' => $notes,
                    'created_by' => $authUser['auth_id'] ?? null
                ]);

                $orderId = (int) $db->lastInsertId();

                foreach ($storeItems as $storeItem) {

                    $productId = (int) $storeItem['product_id'];
                    $product = $productsCache[$productId];

                    $this->orderItem->create([
                        'order_id' => $orderId,
                        'product_id' => $storeItem['product_id'],
                        'product_name_ar' =>
                            $product['product_name_ar'] ?? null,
                        'product_name_en' =>
                            $product['product_name_en'] ?? null,
                        'quantity' => $storeItem['Quantity'],
                        'unit_price' => $storeItem['product_Cost'],
                        'discount_amount' => 0,
                        'tax_amount' => 0,
                        'total_amount' => $storeItem['total']
                    ]);

                    /*
                     * خصم الكمية المباعة من مخزون المنتج
                     * (بنحدّث الكاش كمان عشان لو نفس المنتج ظهر تاني
                     * بلون مختلف في نفس السلة، الخصم يبني على آخر قيمة)
                     */
                    $newStock =
                        (int) ($product['stock_quantity'] ?? 0) -
                        (int) $storeItem['Quantity'];

                    $newStock = max(0, $newStock);

                    $this->product->update(
                        $productId,
                        ['stock_quantity' => $newStock]
                    );

                    $productsCache[$productId]['stock_quantity'] =
                        $newStock;
                }

                $createdOrders[] = $this->order->find($orderId);
            }

            /*
             * تفريغ السلة بعد ما اتحولت لأوردرات
             */
            foreach ($items as $item) {
                $this->cartItem->delete($item['cart_items_id']);
            }

            $db->commit();

            return $createdOrders;

        } catch (\Throwable $e) {

            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $e;
        }
    }

    /**
     * كل أوردرات الكاستومر الحالي
     */
    public function listMyOrders(array $authUser): array
    {
        $customerId = $this->currentCustomerId($authUser);

        return $this->order
            ->where('customer_id', '=', $customerId)
            ->orderBy('order_date', 'DESC')
            ->get();
    }

    /**
     * عرض أوردر واحد بتفاصيله (لازم يكون ملك الكاستومر، أو ملك الفيندور
     * لو المحل بتاعه)
     */
    public function showOrder(array $authUser, int $orderId): array
    {
        $order = $this->order->find($orderId);

        if (!$order) {
            throw new RuntimeException(
                'Order not found',
                404
            );
        }

        $accountType = $authUser['account_type'] ?? null;

        if ($accountType === 'customer') {

            $customerId = $this->currentCustomerId($authUser);

            if ((int) $order['customer_id'] !== $customerId) {
                throw new RuntimeException(
                    'You are not authorized to view this order',
                    403
                );
            }

        } elseif ($accountType === 'vendor') {

            $vendorId = $this->currentVendorId($authUser);

            $store = $this->store->find((int) $order['store_id']);

            if (
                !$store ||
                (int) $store['Vendors_com_id'] !== $vendorId
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

        $order['items'] = $this->orderItem
            ->where('order_id', '=', $orderId)
            ->get();

        return $order;
    }

    /**
     * أوردرات محل معين (بشرط إن المحل ملك الفيندور الحالي)
     */
    public function listStoreOrders(array $authUser, int $storeId): array
    {
        $vendorId = $this->currentVendorId($authUser);

        $store = $this->store->find($storeId);

        if (!$store) {
            throw new RuntimeException(
                'Store not found',
                404
            );
        }

        if ((int) $store['Vendors_com_id'] !== $vendorId) {
            throw new RuntimeException(
                'You are not authorized to view this store orders',
                403
            );
        }

        return $this->order
            ->where('store_id', '=', $storeId)
            ->orderBy('order_date', 'DESC')
            ->get();
    }

    /**
     * تحديث حالة أوردر (الفيندور بس، وبس لو الأوردر تابع لمحله)
     */
    public function updateOrderStatus(
        array $authUser,
        int $orderId,
        string $status
    ): array {

        $vendorId = $this->currentVendorId($authUser);

        $status = strtoupper(trim($status));

        if (!in_array($status, self::ALLOWED_STATUSES, true)) {
            throw new RuntimeException(
                'Invalid order status. Allowed: ' .
                    implode(', ', self::ALLOWED_STATUSES),
                422
            );
        }

        $order = $this->order->find($orderId);

        if (!$order) {
            throw new RuntimeException(
                'Order not found',
                404
            );
        }

        $store = $this->store->find((int) $order['store_id']);

        if (
            !$store ||
            (int) $store['Vendors_com_id'] !== $vendorId
        ) {
            throw new RuntimeException(
                'You are not authorized to update this order',
                403
            );
        }

        /*
         * لو الأوردر بيتلغى (وماكانش ملغي بالفعل)، بنرجّع الكميات
         * المباعة لمخزون المنتجات تاني
         */
        if (
            $status === 'CANCELLED' &&
            $order['order_status'] !== 'CANCELLED'
        ) {

            $orderItems = $this->orderItem
                ->where('order_id', '=', $orderId)
                ->get();

            foreach ($orderItems as $orderItem) {

                $product = $this->product->find(
                    (int) $orderItem['product_id']
                );

                if ($product) {

                    $restoredStock =
                        (int) ($product['stock_quantity'] ?? 0) +
                        (int) $orderItem['quantity'];

                    $this->product->update(
                        (int) $orderItem['product_id'],
                        ['stock_quantity' => $restoredStock]
                    );
                }
            }
        }

        $this->order->update(
            $orderId,
            ['order_status' => $status]
        );

        return $this->order->find($orderId);
    }
}
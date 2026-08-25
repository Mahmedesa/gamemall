<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Core\Database;
use RuntimeException;

class CartService
{
    private Cart $cart;
    private CartItem $cartItem;
    private Product $product;

    public function __construct()
    {
        $this->cart = new Cart();
        $this->cartItem = new CartItem();
        $this->product = new Product();
    }

    /**
     * التأكد إن الحساب الحالي "customer" وإرجاع الـ cus_id بتاعه
     */
    private function currentCustomerId(array $authUser): int
    {
        if (($authUser['account_type'] ?? null) !== 'customer') {
            throw new RuntimeException(
                'Only customer accounts can use the cart',
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
     * جلب سلة الكاستومر الحالي، أو إنشاء واحدة جديدة لو معندوش
     */
    private function getOrCreateCart(int $customerId): array
    {
        $cart = $this->cart
            ->where('cus_id', '=', $customerId)
            ->first();

        if ($cart) {
            return $cart;
        }

        $db = Database::connection();

        $this->cart->create([
            'cus_id' => $customerId
        ]);

        $cartId = (int) $db->lastInsertId();

        return $this->cart->find($cartId);
    }

    /**
     * جلب السلة الحالية بكل عناصرها + الإجمالي
     */
    public function getCart(array $authUser): array
    {
        $customerId = $this->currentCustomerId($authUser);

        $cart = $this->getOrCreateCart($customerId);

        $items = $this->cartItem
            ->where('carts_id', '=', $cart['carts_id'])
            ->get();

        $subtotal = 0;

        foreach ($items as $item) {
            $subtotal += (float) ($item['total'] ?? 0);
        }

        return [
            'cart_id' => (int) $cart['carts_id'],
            'items' => $items,
            'items_count' => count($items),
            'subtotal' => round($subtotal, 2)
        ];
    }

    /**
     * إضافة منتج للسلة (أو زيادة الكمية لو موجود بالفعل بنفس اللون)
     */
    public function addItem(array $authUser, array $data): array
    {
        $customerId = $this->currentCustomerId($authUser);

        $productId = $data['product_id'] ?? null;

        if (
            $productId === null ||
            filter_var($productId, FILTER_VALIDATE_INT) === false
        ) {
            throw new RuntimeException(
                'A valid product_id is required',
                422
            );
        }

        $productId = (int) $productId;

        $quantity = $data['quantity'] ?? 1;

        if (
            filter_var($quantity, FILTER_VALIDATE_INT) === false ||
            (int) $quantity <= 0
        ) {
            throw new RuntimeException(
                'Quantity must be a positive integer',
                422
            );
        }

        $quantity = (int) $quantity;

        $colorId = $data['color_id'] ?? null;

        if (
            $colorId !== null &&
            filter_var($colorId, FILTER_VALIDATE_INT) === false
        ) {
            throw new RuntimeException(
                'color_id must be an integer',
                422
            );
        }

        $colorId = $colorId !== null ? (int) $colorId : null;

        /*
         * التأكد إن المنتج موجود وفعّال
         */
        $product = $this->product->find($productId);

        if (!$product) {
            throw new RuntimeException(
                'Product not found',
                404
            );
        }

        if (empty($product['is_active'])) {
            throw new RuntimeException(
                'Product is not available',
                422
            );
        }

        $availableStock = (int) ($product['stock_quantity'] ?? 0);

        $price = (float) ($product['selling_price'] ?? 0);
        $storeId = (int) ($product['store_id'] ?? 0);

        $cart = $this->getOrCreateCart($customerId);

        /*
         * لو نفس المنتج (بنفس اللون) موجود بالفعل في السلة،
         * بنزود الكمية بدل ما نضيف سطر جديد
         */
        $existingItem = $this->cartItem
            ->where('carts_id', '=', $cart['carts_id'])
            ->where('product_id', '=', $productId)
            ->where('color_id', '=', $colorId)
            ->first();

        if ($existingItem) {

            $newQuantity =
                (int) $existingItem['Quantity'] + $quantity;

            if ($newQuantity > $availableStock) {

                $productName =
                    $product['product_name_en'] ??
                    $product['product_name_ar'] ??
                    ('#' . $productId);

                throw new RuntimeException(
                    "Not enough stock for \"{$productName}\". " .
                        "Available: {$availableStock}, " .
                        "in cart already: {$existingItem['Quantity']}, " .
                        "requested to add: {$quantity}",
                    422
                );
            }

            $this->cartItem->update(
                $existingItem['cart_items_id'],
                [
                    'Quantity' => $newQuantity,
                    'product_Cost' => $price,
                    'total' => round($newQuantity * $price, 2)
                ]
            );

        } else {

            if ($quantity > $availableStock) {

                $productName =
                    $product['product_name_en'] ??
                    $product['product_name_ar'] ??
                    ('#' . $productId);

                throw new RuntimeException(
                    "Not enough stock for \"{$productName}\". " .
                        "Available: {$availableStock}, " .
                        "requested: {$quantity}",
                    422
                );
            }

            $this->cartItem->create([
                'carts_id' => $cart['carts_id'],
                'product_id' => $productId,
                'store_id' => $storeId,
                'Quantity' => $quantity,
                'color_id' => $colorId,
                'product_Cost' => $price,
                'total' => round($quantity * $price, 2)
            ]);
        }

        return $this->getCart($authUser);
    }

    /**
     * تعديل كمية عنصر في السلة (لازم يكون العنصر ملك الكاستومر الحالي)
     */
    public function updateItem(
        array $authUser,
        int $cartItemId,
        int $quantity
    ): array {

        $customerId = $this->currentCustomerId($authUser);

        $cart = $this->getOrCreateCart($customerId);

        $item = $this->cartItem->find($cartItemId);

        if (
            !$item ||
            (int) $item['carts_id'] !== (int) $cart['carts_id']
        ) {
            throw new RuntimeException(
                'Cart item not found',
                404
            );
        }

        if ($quantity <= 0) {

            $this->cartItem->delete($cartItemId);

            return $this->getCart($authUser);
        }

        $product = $this->product->find((int) $item['product_id']);

        if ($product) {

            $availableStock = (int) ($product['stock_quantity'] ?? 0);

            if ($quantity > $availableStock) {

                $productName =
                    $product['product_name_en'] ??
                    $product['product_name_ar'] ??
                    ('#' . $item['product_id']);

                throw new RuntimeException(
                    "Not enough stock for \"{$productName}\". " .
                        "Available: {$availableStock}, requested: {$quantity}",
                    422
                );
            }
        }

        $price = (float) ($item['product_Cost'] ?? 0);

        $this->cartItem->update(
            $cartItemId,
            [
                'Quantity' => $quantity,
                'total' => round($quantity * $price, 2)
            ]
        );

        return $this->getCart($authUser);
    }

    /**
     * حذف عنصر من السلة (لازم يكون ملك الكاستومر الحالي)
     */
    public function removeItem(
        array $authUser,
        int $cartItemId
    ): array {

        $customerId = $this->currentCustomerId($authUser);

        $cart = $this->getOrCreateCart($customerId);

        $item = $this->cartItem->find($cartItemId);

        if (
            !$item ||
            (int) $item['carts_id'] !== (int) $cart['carts_id']
        ) {
            throw new RuntimeException(
                'Cart item not found',
                404
            );
        }

        $this->cartItem->delete($cartItemId);

        return $this->getCart($authUser);
    }

    /**
     * تفريغ السلة بالكامل
     */
    public function clearCart(array $authUser): array
    {
        $customerId = $this->currentCustomerId($authUser);

        $cart = $this->getOrCreateCart($customerId);

        $items = $this->cartItem
            ->where('carts_id', '=', $cart['carts_id'])
            ->get();

        foreach ($items as $item) {
            $this->cartItem->delete($item['cart_items_id']);
        }

        return $this->getCart($authUser);
    }
}
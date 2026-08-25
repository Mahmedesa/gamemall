<?php

namespace App\Controllers;

use App\Services\CartService;
use App\Core\Response;
use App\Core\Auth;
use RuntimeException;
use Throwable;

class CartController
{
    private CartService $cartService;

    public function __construct()
    {
        $this->cartService = new CartService();
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

    private function statusFromException(Throwable $e): int
    {
        $code = $e->getCode();

        if (in_array($code, [401, 403, 404, 422], true)) {
            return $code;
        }

        return 400;
    }

    /**
     * عرض السلة الحالية
     * GET /api/customer/cart
     */
    public function show(): void
    {
        try {

            $authUser = Auth::user();

            $result = $this->cartService->getCart($authUser);

            Response::success(
                $result,
                'Cart fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * إضافة منتج للسلة
     * POST /api/customer/cart/items  body: { "product_id": 1, "quantity": 2, "color_id": null }
     */
    public function addItem(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $result = $this->cartService->addItem($authUser, $data);

            Response::success(
                $result,
                'Item added to cart successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * تعديل كمية عنصر في السلة
     * POST /api/customer/cart/items/update  body: { "cart_item_id": 1, "quantity": 3 }
     */
    public function updateItem(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $cartItemId = $data['cart_item_id'] ?? null;

            if (
                $cartItemId === null ||
                filter_var($cartItemId, FILTER_VALIDATE_INT) === false
            ) {
                throw new RuntimeException(
                    'A valid cart_item_id is required',
                    422
                );
            }

            $quantity = $data['quantity'] ?? null;

            if (
                $quantity === null ||
                filter_var($quantity, FILTER_VALIDATE_INT) === false
            ) {
                throw new RuntimeException(
                    'A valid quantity is required',
                    422
                );
            }

            $result = $this->cartService->updateItem(
                $authUser,
                (int) $cartItemId,
                (int) $quantity
            );

            Response::success(
                $result,
                'Cart item updated successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * حذف عنصر من السلة
     * POST /api/customer/cart/items/delete  body: { "cart_item_id": 1 }
     */
    public function removeItem(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $cartItemId = $data['cart_item_id'] ?? null;

            if (
                $cartItemId === null ||
                filter_var($cartItemId, FILTER_VALIDATE_INT) === false
            ) {
                throw new RuntimeException(
                    'A valid cart_item_id is required',
                    422
                );
            }

            $result = $this->cartService->removeItem(
                $authUser,
                (int) $cartItemId
            );

            Response::success(
                $result,
                'Cart item removed successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * تفريغ السلة بالكامل
     * POST /api/customer/cart/clear
     */
    public function clear(): void
    {
        try {

            $authUser = Auth::user();

            $result = $this->cartService->clearCart($authUser);

            Response::success(
                $result,
                'Cart cleared successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }
}
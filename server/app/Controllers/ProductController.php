<?php

namespace App\Controllers;

use App\Services\ProductService;
use App\Core\Response;
use App\Core\Auth;
use RuntimeException;
use Throwable;

class ProductController
{
    private ProductService $productService;

    public function __construct()
    {
        $this->productService = new ProductService();
    }

    /**
     * Get JSON request body
     */
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

    /**
     * قراءة id (store_id أو product_id) من query string أو body
     */
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

    /**
     * تحويل كود الاستثناء لكود HTTP صحيح
     */
    private function statusFromException(Throwable $e): int
    {
        $code = $e->getCode();

        if (in_array($code, [401, 403, 404, 422], true)) {
            return $code;
        }

        return 400;
    }

    /**
     * List products for a given store owned by the authenticated vendor
     * GET /api/vendor/products?store_id=5
     */
    public function index(): void
    {
        try {

            $authUser = Auth::user();

            $storeId = $this->resolveId([], 'store_id');

            $result = $this->productService->listByStore($authUser, $storeId);

            Response::success(
                $result,
                'Products fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * Show a single product (must belong to a store owned by the vendor)
     * GET /api/vendor/products/show?product_id=10
     */
    public function show(): void
    {
        try {

            $authUser = Auth::user();

            $productId = $this->resolveId([], 'product_id');

            $result = $this->productService->show($authUser, $productId);

            Response::success(
                $result,
                'Product fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * Create a product inside a store owned by the authenticated vendor
     * POST /api/vendor/products  body: { "store_id": 5, "product_name_en": "...", ... }
     */
    public function store(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $result = $this->productService->create($authUser, $data);

            Response::success(
                $result,
                'Product created successfully',
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
     * Update a product owned (via its store) by the authenticated vendor
     * POST /api/vendor/products/update  body: { "product_id": 10, ... }
     */
    public function update(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $productId = $this->resolveId($data, 'product_id');

            $result = $this->productService->update($authUser, $productId, $data);

            Response::success(
                $result,
                'Product updated successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * Delete a product owned (via its store) by the authenticated vendor
     * POST /api/vendor/products/delete  body: { "product_id": 10 }
     */
    public function destroy(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $productId = $this->resolveId($data, 'product_id');

            $this->productService->delete($authUser, $productId);

            Response::success(
                [],
                'Product deleted successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }
}
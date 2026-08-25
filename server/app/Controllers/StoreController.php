<?php

namespace App\Controllers;

use App\Services\StoreService;
use App\Core\Response;
use App\Core\Auth;
use RuntimeException;
use Throwable;

class StoreController
{
    private StoreService $storeService;

    public function __construct()
    {
        $this->storeService = new StoreService();
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
     * Resolve store_id
     *
     * From:
     * ?store_id=5
     *
     * OR:
     * {
     *     "store_id": 5
     * }
     */
    private function resolveStoreId(array $data): int
    {
        $storeId = $_GET['store_id'] ?? $data['store_id'] ?? null;

        if (
            $storeId === null ||
            filter_var($storeId, FILTER_VALIDATE_INT) === false
        ) {
            throw new RuntimeException(
                'A valid store_id is required',
                422
            );
        }

        return (int) $storeId;
    }

    /**
     * Convert exception code to HTTP status
     */
    private function statusFromException(Throwable $e): int
    {
        $code = (int) $e->getCode();

        if (in_array($code, [401, 403, 404, 409, 422], true)) {
            return $code;
        }

        return 400;
    }

    /**
     * GET /api/vendor/stores
     *
     * Get authenticated vendor's stores
     */
    public function index(): void
    {
        try {

            /*
             * Authentication and role checking
             * are handled by Router Middleware.
             */
            $authUser = Auth::user();

            $result = $this->storeService->listMyStores(
                $authUser
            );

            Response::success(
                $result,
                'Stores fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * GET /api/vendor/stores/show?store_id=5
     *
     * Show one store belonging to current vendor
     */
    public function show(): void
    {
        try {

            $authUser = Auth::user();

            $storeId = $this->resolveStoreId([]);

            $result = $this->storeService->show(
                $authUser,
                $storeId
            );

            Response::success(
                $result,
                'Store fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * POST /api/vendor/stores
     *
     * Create store
     */
    public function store(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $result = $this->storeService->create(
                $authUser,
                $data
            );

            Response::success(
                $result,
                'Store created successfully',
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
     * POST /api/vendor/stores/update
     *
     * Body:
     *
     * {
     *     "store_id": 5,
     *     "shop_name": "Gaming Store"
     * }
     */
    public function update(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $storeId = $this->resolveStoreId($data);

            $result = $this->storeService->update(
                $authUser,
                $storeId,
                $data
            );

            Response::success(
                $result,
                'Store updated successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * POST /api/vendor/stores/delete
     *
     * Body:
     *
     * {
     *     "store_id": 5
     * }
     */
    public function destroy(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $storeId = $this->resolveStoreId($data);

            $this->storeService->delete(
                $authUser,
                $storeId
            );

            Response::success(
                [],
                'Store deleted successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }
}
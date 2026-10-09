<?php

namespace App\Controllers;

use App\Services\StoreLayoutService;
use App\Core\Response;
use App\Core\Auth;
use RuntimeException;
use Throwable;

class StoreLayoutController
{
    private StoreLayoutService $layoutService;

    public function __construct()
    {
        $this->layoutService = new StoreLayoutService();
    }

    private function getRequestData(): array
    {
        $input = file_get_contents('php://input');

        if (!$input) {
            return [];
        }

        $data = json_decode($input, true);

        return is_array($data) ? $data : [];
    }

    private function getStoreId(array $data): int
    {
        $storeId =
            $_GET['store_id']
            ?? $data['store_id']
            ?? null;

        if (
            $storeId === null ||
            filter_var(
                $storeId,
                FILTER_VALIDATE_INT
            ) === false
        ) {
            throw new RuntimeException(
                'A valid store_id is required',
                422
            );
        }

        return (int)$storeId;
    }

    private function getItemId(array $data): int
    {
        $itemId =
            $_GET['item_id']
            ?? $data['item_id']
            ?? null;

        if (
            $itemId === null ||
            filter_var(
                $itemId,
                FILTER_VALIDATE_INT
            ) === false
        ) {
            throw new RuntimeException(
                'A valid item_id is required',
                422
            );
        }

        return (int)$itemId;
    }

    private function statusFromException(Throwable $e): int
    {
        $code = (int)$e->getCode();

        if (
            in_array(
                $code,
                [401, 403, 404, 409, 422],
                true
            )
        ) {
            return $code;
        }

        return 400;
    }

    /**
     * GET /api/vendor/store-layout
     */
    public function index(): void
    {
        try {

            $authUser = Auth::user();

            $storeId = $this->getStoreId([]);

            $result = $this->layoutService->getLayout(
                $authUser,
                $storeId
            );

            Response::success(
                $result,
                'Store layout fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * POST /api/vendor/store-layout
     */
    public function store(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $storeId = $this->getStoreId($data);

            $result = $this->layoutService->createItem(
                $authUser,
                $storeId,
                $data
            );

            Response::success(
                $result,
                'Layout item created successfully',
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
     * POST /api/vendor/store-layout/update
     */
    public function update(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $storeId = $this->getStoreId($data);
            $itemId = $this->getItemId($data);

            $result = $this->layoutService->updateItem(
                $authUser,
                $storeId,
                $itemId,
                $data
            );

            Response::success(
                $result,
                'Layout item updated successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * POST /api/vendor/store-layout/delete
     */
    public function destroy(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $storeId = $this->getStoreId($data);
            $itemId = $this->getItemId($data);

            $this->layoutService->deleteItem(
                $authUser,
                $storeId,
                $itemId
            );

            Response::success(
                [],
                'Layout item deleted successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }
}
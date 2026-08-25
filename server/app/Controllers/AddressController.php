<?php

namespace App\Controllers;

use App\Services\AddressService;
use App\Core\Response;
use App\Core\Auth;
use RuntimeException;
use Throwable;

class AddressController
{
    private AddressService $addressService;

    public function __construct()
    {
        $this->addressService = new AddressService();
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

    private function resolveAddressId(array $data): int
    {
        $value = $_GET['address_id'] ?? $data['address_id'] ?? null;

        if (
            $value === null ||
            filter_var($value, FILTER_VALIDATE_INT) === false
        ) {
            throw new RuntimeException(
                'A valid address_id is required',
                422
            );
        }

        return (int) $value;
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
     * كل عناوين الكاستومر الحالي
     * GET /api/customer/addresses
     */
    public function index(): void
    {
        try {

            $authUser = Auth::user();

            $result = $this->addressService->list($authUser);

            Response::success(
                $result,
                'Addresses fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * عرض عنوان واحد
     * GET /api/customer/addresses/show?address_id=1
     */
    public function show(): void
    {
        try {

            $authUser = Auth::user();

            $addressId = $this->resolveAddressId([]);

            $result = $this->addressService->show($authUser, $addressId);

            Response::success(
                $result,
                'Address fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * إضافة عنوان جديد
     * POST /api/customer/addresses  body: { "full_address": "...", "gov_id": 1, "city_id": 1 }
     */
    public function store(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $result = $this->addressService->create($authUser, $data);

            Response::success(
                $result,
                'Address created successfully',
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
     * تعديل عنوان
     * POST /api/customer/addresses/update  body: { "address_id": 1, ... }
     */
    public function update(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $addressId = $this->resolveAddressId($data);

            $result = $this->addressService->update(
                $authUser,
                $addressId,
                $data
            );

            Response::success(
                $result,
                'Address updated successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * حذف عنوان
     * POST /api/customer/addresses/delete  body: { "address_id": 1 }
     */
    public function destroy(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $addressId = $this->resolveAddressId($data);

            $this->addressService->delete($authUser, $addressId);

            Response::success(
                [],
                'Address deleted successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }
}
<?php

namespace App\Controllers;

use App\Services\RentalService;
use App\Core\Response;
use App\Core\Auth;
use RuntimeException;
use Throwable;

class RentalController
{
    private RentalService $rentalService;

    public function __construct()
    {
        $this->rentalService = new RentalService();
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
        $storeId = $_GET['store_id']
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

        return (int) $storeId;
    }

    /**
     * Convert exception code to HTTP status
     */
    private function statusFromException(
        Throwable $e
    ): int {

        $code = (int) $e->getCode();

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
     * GET /api/vendor/rentals/available
     *
     * Get stores available for rental
     */
    public function availableStores(): void
    {
        try {

            /*
             * Authentication and vendor role
             * are handled by Router Middleware.
             */

            $result =
                $this->rentalService
                    ->availableStores();

            Response::success(
                $result,
                'Available stores fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * GET /api/vendor/rentals
     *
     * Get current vendor rentals
     */
    public function index(): void
    {
        try {

            $authUser = Auth::user();

            $result =
                $this->rentalService
                    ->myRentals($authUser);

            Response::success(
                $result,
                'Rentals fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * POST /api/vendor/rentals
     *
     * Create rental request
     *
     * Body:
     *
     * {
     *     "store_id": 5,
     *     "monthly_rent": 5000,
     *     "currency_type_id": 2,
     *     "payment_method_id": 5,
     *     "start_date": "2026-09-20",
     *     "end_date": "2027-09-20"
     * }
     */
    public function store(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            /*
             * Validate store_id here so the
             * API returns a clear validation error.
             */
            $this->resolveStoreId($data);

            $result =
                $this->rentalService
                    ->createRental(
                        $authUser,
                        $data
                    );

            Response::success(
                $result,
                'Rental request created successfully',
                201
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }
    public function startPaymob(): void
{
    try {
        $authUser = Auth::user();

        $data = $this->getRequestData();

        $rentalId =
            $_GET['rental_id']
            ?? $data['rental_id']
            ?? null;

        if (
            $rentalId === null ||
            filter_var(
                $rentalId,
                FILTER_VALIDATE_INT
            ) === false
        ) {
            throw new RuntimeException(
                'A valid rental_id is required',
                422
            );
        }

        $result =
            $this->rentalService
                ->startRentPaymobPayment(
                    $authUser,
                    (int) $rentalId
                );

        Response::success(
            $result,
            'Rent payment started successfully'
        );

    } catch (Throwable $e) {
        Response::error(
            $e->getMessage(),
            $this->statusFromException($e)
        );
    }
}
}
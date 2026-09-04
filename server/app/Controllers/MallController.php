<?php

namespace App\Controllers;

use App\Services\MallService;
use App\Core\Response;
use RuntimeException;
use Throwable;

class MallController
{
    private MallService $mallService;

    public function __construct()
    {
        $this->mallService = new MallService();
    }

    /**
     * GET /api/mall
     *
     * Get complete mall world
     */
    public function index(): void
    {
        try {

            $result = $this->mallService->getMall();

            Response::success(
                $result,
                'Mall fetched successfully'
            );

        } catch (Throwable $e) {

            $code = (int) $e->getCode();

            if (!in_array(
                $code,
                [400, 401, 403, 404, 409, 422],
                true
            )) {
                $code = 400;
            }

            Response::error(
                $e->getMessage(),
                $code
            );
        }
    }

    /**
     * GET /api/mall/floor?floor_id=1
     */
    public function floor(): void
    {
        try {

            $floorId = $_GET['floor_id'] ?? null;

            if (
                $floorId === null ||
                filter_var(
                    $floorId,
                    FILTER_VALIDATE_INT
                ) === false
            ) {
                throw new RuntimeException(
                    'A valid floor_id is required',
                    422
                );
            }

            $result = $this->mallService->getFloor(
                (int) $floorId
            );

            Response::success(
                $result,
                'Floor fetched successfully'
            );

        } catch (Throwable $e) {

            $code = (int) $e->getCode();

            if (!in_array(
                $code,
                [400, 401, 403, 404, 409, 422],
                true
            )) {
                $code = 400;
            }

            Response::error(
                $e->getMessage(),
                $code
            );
        }
    }
}
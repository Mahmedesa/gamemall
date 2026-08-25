<?php

namespace App\Controllers;

use App\Models\Unit;
use App\Core\Response;
use Throwable;

class UnitController
{
    private Unit $unit;

    public function __construct()
    {
        $this->unit = new Unit();
    }

    /**
     * Get all units
     */
    public function index(): void
    {
        try {

            $units = $this->unit->all();

            Response::success(
                $units,
                'Units fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get single unit
     * GET /api/units/show?unit_id=1
     */
    public function show(): void
    {
        try {

            $unitId = $_GET['unit_id'] ?? null;

            if (
                $unitId === null ||
                filter_var($unitId, FILTER_VALIDATE_INT) === false
            ) {
                Response::error(
                    'A valid unit_id is required',
                    422
                );

                return;
            }

            $unit = $this->unit->find((int) $unitId);

            if (!$unit) {
                Response::error(
                    'Unit not found',
                    404
                );

                return;
            }

            Response::success(
                $unit,
                'Unit fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                500
            );
        }
    }
}
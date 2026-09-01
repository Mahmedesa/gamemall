<?php

namespace App\Controllers;
use App\Core\Response;
use Throwable;

use App\Models\Currency;

class CurrencyController{
    private Currency $currency;

    public function __construct()
    {
        $this->currency = new Currency();
        
    }

    public function currency(): void
    {
        try {

            $result = $this->currency
                ->where('is_active', '=', 1)
                ->orderBy('currency', 'ASC')
                ->get();

            Response::success(
                $result,
                'Brands fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                400
            );
        }
    }
}
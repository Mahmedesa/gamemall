<?php

namespace App\Models;

class VendorStoreRental extends BaseModel
{
    protected string $table = 'vendor_store_rentals';

    protected string $primaryKey = 'rental_id';

    protected array $fillable = [
        'assignment_id',
        'store_id',
        'Vendors_com_id',
        'start_date',
        'end_date',
        'monthly_rent',
        'currency_type_id',
        'billing_cycle',
        'rental_status',
    ];

    protected bool $timestamps = false;
}
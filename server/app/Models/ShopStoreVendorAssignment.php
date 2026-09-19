<?php

namespace App\Models;

class ShopStoreVendorAssignment extends BaseModel
{
    protected string $table = 'shop_store_vendor_assignments';

    protected string $primaryKey = 'assignment_id';

    protected array $fillable = [
        'store_id',
        'Vendors_com_id',
        'start_date',
        'end_date',
        'assignment_status',
    ];

    protected bool $timestamps = false;
}
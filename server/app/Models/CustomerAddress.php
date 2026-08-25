<?php

namespace App\Models;

class CustomerAddress extends BaseModel
{
    protected string $table = 'shop_customer_address';

    protected string $primaryKey = 'address_id';

    protected array $fillable = [
        'address_name',
        'gov_id',
        'city_id',
        'full_address',
        'zip_code',
        'cus_id'
    ];

    /**
     * الجدول فيه creation_date بس (DEFAULT CURRENT_TIMESTAMP)،
     * ومفيهوش created_at/updated_at بالاسم اللي BaseModel بيتوقعه
     */
    protected bool $timestamps = false;
}
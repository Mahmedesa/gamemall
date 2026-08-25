<?php

namespace App\Models;

class Brand extends BaseModel
{
    protected string $table = 'st_product_brands';

    protected string $primaryKey = 'brand_id';

    protected array $fillable = [
        'brand_code',
        'brand_name_ar',
        'brand_name_en',
        'logo',
        'website',
        'country_id',
        'is_active'
    ];

    protected bool $timestamps = false;
}
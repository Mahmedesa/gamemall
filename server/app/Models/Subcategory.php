<?php

namespace App\Models;

class SubCategory extends BaseModel
{
    protected string $table = 'st_product_subcategories';

    protected string $primaryKey = 'subcategory_id';

    protected array $fillable = [
        'product_category_id',
        'subcategory_code',
        'subcategory_name_ar',
        'subcategory_name_en',
        'image_url',
        'sort_order',
        'is_active'
    ];

    protected bool $timestamps = false;
}
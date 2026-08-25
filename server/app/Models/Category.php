<?php

namespace App\Models;

class Category extends BaseModel
{
    protected string $table = 'st_product_categories';

    protected string $primaryKey = 'product_category_id';

    protected array $fillable = [
        'category_code',
        'product_department_id',
        'category_name_ar',
        'category_name_en',
        'image_url',
        'sort_order',
        'is_active'
    ];

    protected bool $timestamps = false;
}
<?php

namespace App\Models;

class Department extends BaseModel
{
    protected string $table = 'st_product_departments';

    protected string $primaryKey = 'product_department_id';

    protected array $fillable = [
        'department_code',
        'department_name_ar',
        'department_name_en',
        'image_url',
        'icon',
        'sort_order',
        'is_active'
    ];

    protected bool $timestamps = false;
}
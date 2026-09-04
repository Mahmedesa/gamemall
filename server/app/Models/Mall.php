<?php

namespace App\Models;

class Mall extends BaseModel
{
    protected string $table = 'shop_mall';

    protected string $primaryKey = 'mall_id';

    protected array $fillable = [
        'mall_name_AR',
        'mall_name_EN',
        'mall_floor_number'
    ];

    protected bool $timestamps = false;
}
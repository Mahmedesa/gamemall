<?php

namespace App\Models;

class MallFloor extends BaseModel
{
    protected string $table = 'shop_mall_floors';

    protected string $primaryKey = 'floor_id';

    protected array $fillable = [
        'mall_id',
        'floor_name_AR',
        'floor_name_EN'
    ];

    protected bool $timestamps = false;
}
<?php

namespace App\Models;

class StoreLocation extends BaseModel
{
    protected string $table = 'shop_store_locations';

    protected string $primaryKey = 'id';

    protected array $fillable = [
        'location_id',
        'store_id',
        'floor_id',
        'mall_id',
        'position_x',
        'position_y',
        'position_z',
        'rotation',
        'scale'
    ];

    protected bool $timestamps = false;
}
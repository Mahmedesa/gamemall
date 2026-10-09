<?php

namespace App\Models;

class StoreProductPlacement extends BaseModel
{
    protected string $table = 'store_product_placements';

    protected string $primaryKey = 'id';

    protected array $fillable = [
        'store_id',
        'product_id',
        'layout_item_id',
        'position_x',
        'position_y',
        'position_z',
        'rotation_y',
        'display_type',
        'shelf_level',
        'display_order',
    ];
}


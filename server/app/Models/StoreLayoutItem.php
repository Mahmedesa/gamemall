<?php

namespace App\Models;

class StoreLayoutItem extends BaseModel
{
    protected string $table = 'store_layout_items';

    protected string $primaryKey = 'id';

    protected array $fillable = [
        'store_id',
        'item_type',
        'position_x',
        'position_y',
        'position_z',
        'rotation_x',
        'rotation_y',
        'rotation_z',
        'width',
        'height',
        'depth',
    ];
}


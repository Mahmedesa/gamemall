<?php

namespace App\Models;

class CartItem extends BaseModel
{
    protected string $table = 'shop_carts_items';

    protected string $primaryKey = 'cart_items_id';

    protected array $fillable = [
        'carts_id',
        'product_id',
        'store_id',
        'Quantity',
        'product_number',
        'weight',
        'color_id',
        'product_Cost',
        'total'
    ];

    /**
     * الجدول ده مفيهوش created_at ولا updated_at خالص
     */
    protected bool $timestamps = false;
}
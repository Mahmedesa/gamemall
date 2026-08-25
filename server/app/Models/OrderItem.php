<?php

namespace App\Models;

class OrderItem extends BaseModel
{
    protected string $table = 'shop_order_items';

    protected string $primaryKey = 'order_item_id';

    protected array $fillable = [
        'order_id',
        'product_id',
        'product_name_ar',
        'product_name_en',
        'quantity',
        'unit_price',
        'discount_amount',
        'tax_amount',
        'total_amount'
    ];

    /**
     * الجدول فيه created_at بس، مفيهوش updated_at
     */
    protected bool $timestamps = false;
}
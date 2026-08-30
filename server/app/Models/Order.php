<?php

namespace App\Models;

class Order extends BaseModel
{
    protected string $table = 'shop_stores_orders';

    protected string $primaryKey = 'order_id';

    protected array $fillable = [
        'order_code',
        'store_id',
        'customer_id',
        'cus_address_id',
        'order_status',
        'payment_status',
        'payment_method_id',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'shipping_amount',
        'total_amount',
        'notes',
        'created_by'
    ];

    /**
     * الجدول فيه created_at و updated_at، فبنسيب الـ timestamps
     * الافتراضية شغالة (BaseModel::$timestamps = true)
     */
}
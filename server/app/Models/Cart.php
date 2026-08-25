<?php

namespace App\Models;

class Cart extends BaseModel
{
    protected string $table = 'shop_carts';

    protected string $primaryKey = 'carts_id';

    protected array $fillable = [
        'cus_id'
    ];

    /**
     * الجدول فيه created_at و updated_at، فبنسيب الـ timestamps
     * الافتراضية شغالة (BaseModel::$timestamps = true)
     */
}
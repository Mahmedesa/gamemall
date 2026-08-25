<?php

namespace App\Models;

class Store extends BaseModel
{
    protected string $table = 'shop_vendors_stores';

    protected string $primaryKey = 'store_id';

    protected array $fillable = [
        'Vendors_com_id',
        'shop_name',
        'floor_num',
        'shop_logo',
        'shop_specializes',
        'is_active'
    ];

    /**
     * جدول shop_vendors_stores فيه created_at بس (DEFAULT CURRENT_TIMESTAMP)
     * ومفيهوش عمود updated_at، فلازم نعطل الـ timestamps التلقائية في BaseModel
     * عشان متحاولش تضيف updated_at غير موجود أصلاً.
     */
    protected bool $timestamps = false;
}
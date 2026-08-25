<?php

namespace App\Models;

class Review extends BaseModel
{
    protected string $table = 'product_store_reviews';

    protected string $primaryKey = 'review_id';

    protected array $fillable = [
        'store_id',
        'product_id',
        'cus_id',
        'rating',
        'review_title',
        'review_text',
        'is_verified_purchase',
        'is_approved',
        'is_active',
        'is_deleted'
    ];

    /**
     * الجدول فيه created_at و updated_at، فبنسيب الـ timestamps
     * الافتراضية شغالة (BaseModel::$timestamps = true)
     */
}
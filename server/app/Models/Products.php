<?php

namespace App\Models;

class Product extends BaseModel
{
    protected string $table = 'shop_vendors_products';

    protected string $primaryKey = 'product_id';

    protected array $fillable = [
        'barcode',
        'store_id',
        'sku',
        'product_name_ar',
        'product_name_en',
        'product_department_id',
        'product_category_id',
        'subcategory_id',
        'brand_id',
        'unit_id',
        'description_ar',
        'description_en',
        'purchase_price',
        'selling_price',
        'cost_price',
        'vat',
        'weight',
        'width',
        'height',
        'length',
        'stock_quantity',
        'min_stock',
        'max_stock',
        'image',
        'is_featured',
        'is_active'
    ];

    /**
     * جدول shop_vendors_products فيه created_at بس (DEFAULT CURRENT_TIMESTAMP)
     * ومفيهوش عمود updated_at، فلازم نعطل الـ timestamps التلقائية في BaseModel.
     */
    protected bool $timestamps = false;
}
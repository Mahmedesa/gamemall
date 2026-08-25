<?php

namespace App\Models;

class PaymentMethod extends BaseModel
{
    protected string $table = 'payment_method';

    protected string $primaryKey = 'payment_method_id';

    protected array $fillable = [
        'payment_name_AR',
        'payment_name_EN',
        'is_active',
    ];

    protected bool $timestamps = false;
}
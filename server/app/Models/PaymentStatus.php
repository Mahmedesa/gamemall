<?php

namespace App\Models;

class PaymentStatus extends BaseModel
{
    protected string $table = 'ST_payment_statuses';

    protected string $primaryKey = 'payment_statuses_id';

    protected array $fillable = [
        'payment_status_code',
        'payment_status_name_AR',
        'payment_status_name_EN',
        'is_active',
    ];

    protected bool $timestamps = false;
}
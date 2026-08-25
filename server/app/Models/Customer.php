<?php

namespace App\Models;

class Customer extends BaseModel
{
    protected string $table = 'shop_customer';

    protected string $primaryKey = 'cus_id';

    protected array $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'Gender',
        'birth_date',
        'is_active',
    ];

    protected bool $timestamps = false;
}
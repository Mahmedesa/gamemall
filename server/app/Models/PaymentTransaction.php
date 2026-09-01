<?php

namespace App\Models;

class PaymentTransaction extends BaseModel
{
    protected string $table = 'shop_payment_transactions';

    protected string $primaryKey = 'payment_transactions_id';

    protected array $fillable = [
        'order_id',
        'payment_method_id',
        'gateway_name',
        'gateway_transaction_id',
        'transaction_reference',
        'payment_statuses_id',
        'total',
        'currency_type_id',
    ];
    protected bool $timestamps = false;
}
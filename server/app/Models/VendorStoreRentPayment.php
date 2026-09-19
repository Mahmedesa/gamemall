<?php

namespace App\Models;

class VendorStoreRentPayment extends BaseModel
{
    protected string $table = 'vendor_store_rent_payments';

    protected string $primaryKey = 'rent_payment_id';

    protected array $fillable = [
        'rental_id',
        'billing_period',
        'due_date',
        'amount',
        'currency_type_id',
        'payment_status',
        'payment_method_id',
        'gateway_name',
        'gateway_transaction_id',
        'transaction_reference',
        'paid_at',
    ];

    protected bool $timestamps = false;
}
<?php

namespace App\Models;

class XpTransaction extends BaseModel
{
    protected string $table = 'shop_cust_xp_transactions';

    protected string $primaryKey = 'xp_id';

    protected array $fillable = [
        'cus_id',
        'xp_name',
        'source',
        'reference_id'
    ];

    protected bool $timestamps = false;
}
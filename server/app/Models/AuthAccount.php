<?php

namespace App\Models;

class AuthAccount extends BaseModel
{
    protected string $table = 'auth_accounts';

    protected string $primaryKey = 'auth_id';

    protected array $fillable = [
        'username',
        'password_hash',
        'account_type',
        'user_id',
        'customer_id',
        'vendor_id',
        'status',
        'login_enabled',
        'two_factor_enabled',
        'failed_login_attempts',
        'locked_until',
        'last_login_at',
        'last_password_change_at',
    ];

    protected bool $timestamps = true;
}
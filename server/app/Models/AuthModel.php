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
        'account_id',
        'status',
        'login_enabled'
    ];

    protected bool $timestamps = true;
}
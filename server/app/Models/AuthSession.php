<?php

namespace App\Models;

class AuthSession extends BaseModel
{
    protected string $table = 'auth_sessions';

    protected string $primaryKey = 'session_id';

    protected array $fillable = [
        'auth_id',
        'session_token_hash',
        'ip_address',
        'user_agent',
        'expires_at',
        'revoked_at',
        'last_seen_at',
    ];

    protected bool $timestamps = false;
}
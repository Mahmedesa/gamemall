<?php

namespace App\Models;

class User extends BaseModel
{
    protected string $table = 'users';

    protected string $primaryKey = 'users_id';

    protected array $fillable = [
        'public_id',
        'username',
        'first_name',
        'last_name',
        'display_name',
        'email',
        'phone',
        'user_type',
        'parent_id',
        'status',
        'login_enabled',
        'must_change_password',
        'profile_completed',
        'failed_login_attempts',
        'locked_until',
        'last_login_at',
        'last_password_change_at',
        'roles_id',
        'profile_type',
    ];

    protected bool $timestamps = true;
}
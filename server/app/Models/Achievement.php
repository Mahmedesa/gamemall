<?php

namespace App\Models;

class Achievement extends BaseModel
{
    protected string $table = 'shop_achievements';

    protected string $primaryKey = 'achievement_id';

    protected array $fillable = [
        'achievements_name',
        'achievements_description',
        'icon',
        'xp_reward',
        'coin_reward'
    ];

    protected bool $timestamps = false;
}
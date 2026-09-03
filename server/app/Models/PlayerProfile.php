<?php

namespace App\Models;

class PlayerProfile extends BaseModel
{
    protected string $table = 'shop_player_profiles';

    protected string $primaryKey = 'player_id';

    protected array $fillable = [
        'cus_id',
        'player_level',
        'xp_id',
        'coins',
        'gems',
        'avatar'
    ];

    /**
     * الجدول فيه created_at بس
     */
    protected bool $timestamps = false;
}
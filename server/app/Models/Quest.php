<?php

namespace App\Models;

class Quest extends BaseModel
{
    protected string $table = 'shop_quests';

    protected string $primaryKey = 'quest_id';

    protected array $fillable = [
        'name_ar',
        'name_en',
        'descriptions',
        'xp_reward',
        'coin_reward',
        'quests_type',
        'target',
        'is_active'
    ];

    protected bool $timestamps = false;
}
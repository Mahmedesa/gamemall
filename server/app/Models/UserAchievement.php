<?php

namespace App\Models;

class UserAchievement extends BaseModel
{
    protected string $table = 'shop_user_achievements';

    protected string $primaryKey = 'id';

    protected array $fillable = [
        'cus_id',
        'achievement_id',
        'unlocked_at'
    ];

    /**
     * الجدول ده مفيهوش created_at ولا updated_at خالص
     * (عنده unlocked_at بس وإحنا بنحطها يدويًا)
     */
    protected bool $timestamps = false;
}
<?php

namespace App\Models;

class UserQuest extends BaseModel
{
    protected string $table = 'user_quests';

    protected string $primaryKey = 'id';

    protected array $fillable = [
        'cus_id',
        'quest_id',
        'progress',
        'quests_status',
        'started_at',
        'completed_at'
    ];

    protected bool $timestamps = false;
}
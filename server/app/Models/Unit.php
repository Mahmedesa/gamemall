<?php

namespace App\Models;

class Unit extends BaseModel
{
    protected string $table = 'st_attributes_units';

    protected string $primaryKey = 'unit_id';

    protected array $fillable = [
        'unit_name_ar',
        'unit_name_en',
        'unit_symbol',
        'attribute_id',
        'color_id',
    ];

    protected bool $timestamps = false;
}
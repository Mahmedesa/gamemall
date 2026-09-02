<?php
namespace App\Models; 

class Currency extends BaseModel{
    protected string $table = 'currency';

    protected string $primaryKey = 'currency_type_id';

    protected array $fillable = [
        'currency_type_name',
        'currency_abbre',
        'Name_EN',
        'country_abbrev',
        'currency_abbrev',
    ];
}
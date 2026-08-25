<?php

namespace App\Models;

class Vendor extends BaseModel
{
    protected string $table = 'shop_vendors_com';

    protected string $primaryKey = 'Vendors_com_id';

    protected array $fillable = [
        'Vendors_com_name',
        'Trade_name',
        'com_owner_name',
        'activity_type_id',
        'establishment_year',
        'Number_employees',
        'capital',
        'About_company',
        'email',
        'security_question_id',
        'answer_question',
        'is_active',
        'Enable_two_factor',
        'company_logo',
    ];

    protected bool $timestamps = false;
}
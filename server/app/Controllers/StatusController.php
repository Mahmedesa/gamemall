<?php

namespace App\Controllers;

use App\Core\Response;

class StatusController
{
    public function index()
    {
        Response::success([
            "project" => "GameMall",
            "version" => "1.0.0"
        ]);
    }
}
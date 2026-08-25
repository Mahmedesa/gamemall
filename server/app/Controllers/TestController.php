<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;

class TestController
{
    public function index()
    {
        $request = new Request();

        Response::success([
            "method" => $request->method(),
            "name" => $request->input("name"),
            "email" => $request->input("email"),
            "page" => $request->query("page"),
            "isJson" => $request->isJson()
        ]);
        
    }
    
}
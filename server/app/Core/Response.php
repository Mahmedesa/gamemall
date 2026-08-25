<?php

namespace App\Core;

class Response
{
    public static function json($data, int $status = 200): void
    {
        http_response_code($status);

        header('Content-Type: application/json');

        echo json_encode(
            $data,
            JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
        );

        exit;
    }

    public static function success(
        array $data = [],
        string $message = "Success",
        int $status = 200
    ): void {

        self::json([
            "success" => true,
            "message" => $message,
            "data" => $data
        ], $status);

    }

    public static function error(
        string $message,
        int $status = 400
    ): void {

        self::json([
            "success" => false,
            "message" => $message
        ], $status);

    }
}
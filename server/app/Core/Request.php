<?php

namespace App\Core;

class Request
{
    /**
     * جميع البيانات القادمة من Body (JSON أو Form Data)
     */
    public function all(): array
    {
        $data = [];

        // إذا كان الطلب JSON
        $json = json_decode(file_get_contents("php://input"), true);

        if (is_array($json)) {
            $data = $json;
        } else {
            $data = $_POST;
        }

        return $data;
    }

    /**
     * قراءة قيمة واحدة من Body
     */
    public function input(string $key, $default = null)
    {
        $data = $this->all();

        return $data[$key] ?? $default;
    }

    /**
     * قراءة Query String
     */
    public function query(string $key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }

    /**
     * معرفة نوع الطلب
     */
    public function method(): string
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    /**
     * معرفة URI
     */
    public function uri(): string
    {
        return parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    }

    /**
     * هل الطلب JSON؟
     */
    public function isJson(): bool
    {
        return str_contains(
            $_SERVER['CONTENT_TYPE'] ?? '',
            'application/json'
        );
    }
}
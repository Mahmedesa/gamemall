<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Router;

header('Content-Type: application/json');

$router = new Router();

require_once __DIR__ . '/../routes/api.php';

// الحصول على الرابط
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// مسار المشروع داخل htdocs
$basePath = '/gmaemalling/server/public';

// إزالة الـ Base Path
if (str_starts_with($uri, $basePath)) {
    $uri = substr($uri, strlen($basePath));
}

// إذا أصبح فارغًا
if ($uri === '') {
    $uri = '/';
}

$router->dispatch(
    $_SERVER['REQUEST_METHOD'],
    $uri
);
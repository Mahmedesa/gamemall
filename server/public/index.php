<?php

// ============================================================
// CORS
// ============================================================

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ============================================================
// Autoload
// ============================================================

require_once __DIR__ . '/../vendor/autoload.php';

// ============================================================
// Imports
// ============================================================

use App\Core\Router;

// ============================================================
// JSON Response
// ============================================================

header('Content-Type: application/json; charset=UTF-8');

// ============================================================
// Router
// ============================================================

$router = new Router();

// ============================================================
// API Routes
// ============================================================

require_once __DIR__ . '/../routes/api.php';

// ============================================================
// Get Request URI
// ============================================================

$uri = parse_url(
    $_SERVER['REQUEST_URI'],
    PHP_URL_PATH
);

// ============================================================
// Project Base Path
// ============================================================

$basePath = '/gmaemalling/server/public';

// ============================================================
// Remove Base Path
// ============================================================

if (str_starts_with($uri, $basePath)) {

    $uri = substr(
        $uri,
        strlen($basePath)
    );
}

// ============================================================
// Empty URI
// ============================================================

if ($uri === '' || $uri === false) {
    $uri = '/';
}

// ============================================================
// Dispatch Route
// ============================================================

$router->dispatch(
    $_SERVER['REQUEST_METHOD'],
    $uri
);
<?php

use App\Controllers\StatusController;
use App\Controllers\TestController;
use App\Controllers\DatabaseController;
use App\Controllers\AuthController;
use App\Controllers\StoreController;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Controllers\ProductController;
use App\Controllers\CategoryController;
use App\Controllers\CartController;
use App\Controllers\OrderController;
use App\Controllers\UnitController;
use App\Controllers\AddressController;
use App\Controllers\ReviewController;
use App\Controllers\PaymentController;

/** @var App\Core\Router $router */


$router->get('/api/status', [StatusController::class, 'index']);
$router->post('/api/test', [TestController::class, 'index']);
$router->get('/api/database', [
    DatabaseController::class,
    'index'
]);
$router->post(
    '/api/auth/register/user',
    [AuthController::class, 'registerUser']
);
$router->post(
    '/api/auth/register/customer',
    [AuthController::class, 'registerCustomer']
);
$router->post(
    '/api/auth/register/vendor',
    [AuthController::class, 'registerVendor']
);
$router->post(
    '/api/auth/login',
    [AuthController::class, 'login']
);
$router->get(
    '/api/auth/me',
    [AuthController::class, 'me']
);
$router->post(
    '/api/auth/logout',
    [AuthController::class, 'logout']
);
$router->get(
    '/api/test/customer',
    [AuthController::class, 'testCustomer'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->get(
    '/api/test/vendor',
    [AuthController::class, 'testVendor'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);
$router->get(
    '/api/vendor/stores',
    [StoreController::class, 'index'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);

$router->get(
    '/api/vendor/stores/show',
    [StoreController::class, 'show'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);

$router->post(
    '/api/vendor/stores',
    [StoreController::class, 'store'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);

$router->post(
    '/api/vendor/stores/update',
    [StoreController::class, 'update'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);

$router->post(
    '/api/vendor/stores/delete',
    [StoreController::class, 'destroy'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);

/*
|--------------------------------------------------------------------------
| Product Routes (Vendor only - ownership enforced via store ownership)
|--------------------------------------------------------------------------
*/
$router->get(
    '/api/vendor/products',
    [ProductController::class, 'index'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);
$router->get(
    '/api/vendor/products/show',
    [ProductController::class, 'show'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);
$router->post(
    '/api/vendor/products',
    [ProductController::class, 'store'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);
$router->post(
    '/api/vendor/products/update',
    [ProductController::class, 'update'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);
$router->post(
    '/api/vendor/products/delete',
    [ProductController::class, 'destroy'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);

/*
|--------------------------------------------------------------------------
| Category / Department / Brand / Unit Routes (Public - no auth required)
|--------------------------------------------------------------------------
*/
$router->get(
    '/api/departments',
    [CategoryController::class, 'departments']
);
$router->get(
    '/api/categories',
    [CategoryController::class, 'categories']
);
$router->get(
    '/api/subcategories',
    [CategoryController::class, 'subcategories']
);
$router->get(
    '/api/brands',
    [CategoryController::class, 'brands']
);
$router->get(
    '/api/units',
    [UnitController::class, 'index']
);

$router->get(
    '/api/units/show',
    [UnitController::class, 'show']
);

/*
|--------------------------------------------------------------------------
| Cart Routes (Customer only)
|--------------------------------------------------------------------------
*/
$router->get(
    '/api/customer/cart',
    [CartController::class, 'show'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->post(
    '/api/customer/cart/items',
    [CartController::class, 'addItem'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->post(
    '/api/customer/cart/items/update',
    [CartController::class, 'updateItem'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->post(
    '/api/customer/cart/items/delete',
    [CartController::class, 'removeItem'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->post(
    '/api/customer/cart/clear',
    [CartController::class, 'clear'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);

/*
|--------------------------------------------------------------------------
| Order Routes
|--------------------------------------------------------------------------
*/
$router->post(
    '/api/customer/orders/checkout',
    [OrderController::class, 'checkout'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->get(
    '/api/customer/orders',
    [OrderController::class, 'myOrders'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->get(
    '/api/orders/show',
    [OrderController::class, 'show'],
    [
        AuthMiddleware::class
    ]
);
$router->get(
    '/api/vendor/orders',
    [OrderController::class, 'storeOrders'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);
$router->post(
    '/api/vendor/orders/update-status',
    [OrderController::class, 'updateStatus'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'vendor'
        ]
    ]
);


/*
|--------------------------------------------------------------------------
| Customer Address Routes (Customer only)
|--------------------------------------------------------------------------
*/
$router->get(
    '/api/customer/addresses',
    [AddressController::class, 'index'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->get(
    '/api/customer/addresses/show',
    [AddressController::class, 'show'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->post(
    '/api/customer/addresses',
    [AddressController::class, 'store'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->post(
    '/api/customer/addresses/update',
    [AddressController::class, 'update'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->post(
    '/api/customer/addresses/delete',
    [AddressController::class, 'destroy'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);

/*
|--------------------------------------------------------------------------
| Review Routes
|--------------------------------------------------------------------------
*/
$router->get(
    '/api/reviews/product',
    [ReviewController::class, 'byProduct']
);
$router->get(
    '/api/reviews/store',
    [ReviewController::class, 'byStore']
);
$router->get(
    '/api/customer/reviews',
    [ReviewController::class, 'myReviews'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->post(
    '/api/customer/reviews',
    [ReviewController::class, 'store'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->post(
    '/api/customer/reviews/update',
    [ReviewController::class, 'update'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);
$router->post(
    '/api/customer/reviews/delete',
    [ReviewController::class, 'destroy'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            'customer'
        ]
    ]
);

/* |-------------------------------------------------------------------------- | Payment Routes |-------------------------------------------------------------------------- */ /* * Get active payment methods * * GET /api/payment/methods * * أي User authenticated يقدر يشوف طرق الدفع. */
$router->get(
    '/api/payment/methods', 
    [
        PaymentController::class, 'methods'
        ], 
        [AuthMiddleware::class
    ]
); /* * Get payment information * * GET /api/payment/order?order_id=1 * * Customer only */
$router->get('/api/payment/order', [PaymentController::class, 'orderPayment'], [AuthMiddleware::class, [RoleMiddleware::class, 'customer']]); /* * Get payment status * * GET /api/payment/status?order_id=1 * * Customer only */
$router->get('/api/payment/status', [PaymentController::class, 'status'], [AuthMiddleware::class, [RoleMiddleware::class, 'customer']]); /* * Change payment method * * POST /api/payment/change-method * * Customer only */
$router->post('/api/payment/change-method', [PaymentController::class, 'changeMethod'], [AuthMiddleware::class, [RoleMiddleware::class, 'customer']]); /* * Update payment status * * POST /api/payment/status * * Customer only for now. * * لاحقًا عندما نعمل Payment Gateway: * الـ Gateway Callback هو اللي هيستخدم * Service مباشرة بدل ما نفتح endpoint * للعميل يغير PAID بنفسه. */
$router->post('/api/payment/status', [PaymentController::class, 'updateStatus'], [AuthMiddleware::class, [RoleMiddleware::class, 'customer']]);

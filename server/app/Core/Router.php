<?php

namespace App\Core;

use Throwable;

class Router
{
    private array $routes = [];

    /**
     * Register GET route
     */
    public function get(
        string $uri,
        callable|array $action,
        array $middleware = []
    ): void {
        $this->addRoute(
            'GET',
            $uri,
            $action,
            $middleware
        );
    }

    /**
     * Register POST route
     */
    public function post(
        string $uri,
        callable|array $action,
        array $middleware = []
    ): void {
        $this->addRoute(
            'POST',
            $uri,
            $action,
            $middleware
        );
    }

    /**
     * Add route
     */
    private function addRoute(
        string $httpMethod,
        string $uri,
        callable|array $action,
        array $middleware = []
    ): void {

        $this->routes[$httpMethod][$uri] = [
            'action' => $action,
            'middleware' => $middleware
        ];
    }

    /**
     * Dispatch request
     */
    public function dispatch(
        string $httpMethod,
        string $uri
    ): void {

        /*
         * Route not found
         */
        if (!isset(
            $this->routes[$httpMethod][$uri]
        )) {

            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Route Not Found'
            ]);

            return;
        }

        /*
         * Get route
         */
        $route =
            $this->routes[$httpMethod][$uri];

        /*
         * Run middleware
         */
        try {

            foreach (
                $route['middleware']
                as $middleware
            ) {

                $this->runMiddleware(
                    $middleware
                );
            }

            /*
             * Execute controller
             */
            $this->executeAction(
                $route['action']
            );

        } catch (Throwable $e) {

            http_response_code(401);

            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Run middleware
     */
    private function runMiddleware(
        mixed $middleware
    ): void {

        /*
         * Middleware with parameters
         *
         * [
         *     RoleMiddleware::class,
         *     'customer'
         * ]
         */
        if (is_array($middleware)) {

            $class =
                $middleware[0];

            $parameters =
                array_slice(
                    $middleware,
                    1
                );

        } else {

            /*
             * Middleware without parameters
             */
            $class = $middleware;

            $parameters = [];
        }

        /*
         * Create middleware instance
         */
        $instance = new $class();

        /*
         * Run handle()
         */
        $instance->handle(
            ...$parameters
        );
    }

    /**
     * Execute Controller
     */
    private function executeAction(
        callable|array $action
    ): void {

        /*
         * Closure
         */
        if (is_callable($action)) {

            $action();

            return;
        }

        /*
         * Controller
         */
        [$controller, $method] =
            $action;

        $instance =
            new $controller();

        $instance->$method();
    }
}
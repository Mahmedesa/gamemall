<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use PDOException;

class DatabaseController
{
    public function index(): void
    {
        try {

            $db = Database::connection();

            // MySQL Version
            $version = $db
                ->query("SELECT VERSION() AS version")
                ->fetch();

            // Tables required by our Auth system
            $tables = [
                'auth_accounts',
                'auth_sessions',
                'users',
                'shop_customer',
                'shop_vendors_com'
            ];

            $tableStatus = [];

            foreach ($tables as $table) {

                $stmt = $db->prepare(
                    "SHOW TABLES LIKE :table"
                );

                $stmt->execute([
                    'table' => $table
                ]);

                $tableStatus[$table] = $stmt->fetch() !== false;
            }

            Response::success([
                'database' => 'connected',
                'mysql_version' => $version['version'] ?? null,
                'tables' => $tableStatus
            ]);

        } catch (PDOException $e) {

            Response::error(
                'Database connection failed',
                500
            );
        }
    }
}
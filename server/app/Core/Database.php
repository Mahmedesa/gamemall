<?php

namespace App\Core;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection === null) {

            $config = require __DIR__ . '/../../config/Database.php';

            $dsn =
                "mysql:host={$config['host']};" .
                "port={$config['port']};" .
                "dbname={$config['database']};" .
                "charset={$config['charset']}";

            try {

                self::$connection = new PDO(
                    $dsn,
                    $config['username'],
                    $config['password']
                );

                self::$connection->setAttribute(
                    PDO::ATTR_ERRMODE,
                    PDO::ERRMODE_EXCEPTION
                );

                self::$connection->setAttribute(
                    PDO::ATTR_DEFAULT_FETCH_MODE,
                    PDO::FETCH_ASSOC
                );

            } catch (PDOException $e) {

                Response::error(
                    "Database Connection Failed",
                    500
                );

            }

        }

        return self::$connection;
    }
}
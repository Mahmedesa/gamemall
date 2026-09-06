<?php

return [
    'api_key' => $_ENV['PAYMOB_API_KEY'] ?? '',
    'public_key' => $_ENV['PAYMOB_PUBLIC_KEY'] ?? '',
    'secret_key' => $_ENV['PAYMOB_SECRET_KEY'] ?? '',
    'integration_id' => (int) ($_ENV['PAYMOB_INTEGRATION_ID'] ?? 0),

    'notification_url' => $_ENV['PAYMOB_NOTIFICATION_URL'] ?? '',
    'redirection_url' => $_ENV['PAYMOB_REDIRECTION_URL'] ?? '',
];
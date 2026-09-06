<?php

namespace App\Services;

use RuntimeException;

class PaymobService
{
    private string $baseUrl = 'https://accept.paymob.com';

    private string $secretKey;
    private string $publicKey;
    private int $integrationId;

    public function __construct()
    {
        $config = require dirname(__DIR__, 2) . '/config/paymob.php';

        $this->secretKey = $config['secret_key'] ?? '';
        $this->publicKey = $config['public_key'] ?? '';
        $this->integrationId = (int) ($config['integration_id'] ?? 0);

        if ($this->secretKey === '') {
            throw new RuntimeException(
                'Paymob secret key is not configured'
            );
        }

        if ($this->publicKey === '') {
            throw new RuntimeException(
                'Paymob public key is not configured'
            );
        }

        if ($this->integrationId <= 0) {
            throw new RuntimeException(
                'Paymob integration ID is not configured'
            );
        }
    }

    /**
     * إنشاء Payment Intention في Paymob
     */
    public function createIntention(
        int $amountCents,
        string $currency,
        string $merchantOrderId,
        string $customerEmail,
        string $customerFirstName,
        string $customerLastName,
        string $customerPhone
    ): array {

        if ($amountCents <= 0) {
            throw new RuntimeException(
                'Payment amount must be greater than zero',
                422
            );
        }

        if ($currency === '') {
            throw new RuntimeException(
                'Payment currency is required',
                422
            );
        }

        if ($merchantOrderId === '') {
            throw new RuntimeException(
                'Merchant order ID is required',
                422
            );
        }

        if ($customerEmail === '') {
            throw new RuntimeException(
                'Customer email is required',
                422
            );
        }

        $config = require dirname(__DIR__, 2) . '/config/paymob.php';

        if (empty($config['notification_url'])) {
            throw new RuntimeException(
                'Paymob notification URL is not configured'
            );
        }

        if (empty($config['redirection_url'])) {
            throw new RuntimeException(
                'Paymob redirection URL is not configured'
            );
        }

        $payload = [
            'amount' => $amountCents,

            'currency' => $currency,

            'payment_methods' => [
                $this->integrationId
            ],

            'special_reference' => $merchantOrderId,

            'notification_url' => $config['notification_url'],

            'redirection_url' => $config['redirection_url'],

            'items' => [],

            'billing_data' => [
                'first_name' => $customerFirstName ?: 'Customer',
                'last_name' => $customerLastName ?: 'Customer',
                'email' => $customerEmail,
                'phone_number' => $customerPhone ?: 'NA',

                'apartment' => 'NA',
                'floor' => 'NA',
                'building' => 'NA',
                'street' => 'NA',
                'postal_code' => 'NA',
                'city' => 'Cairo',
                'state' => 'Cairo',
                'country' => 'EGY'
            ]
        ];

        $jsonPayload = json_encode(
            $payload,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );

        if ($jsonPayload === false) {
            throw new RuntimeException(
                'Failed to encode Paymob request'
            );
        }

        $ch = curl_init(
            $this->baseUrl . '/v1/intention/'
        );

        curl_setopt_array($ch, [
            CURLOPT_POST => true,

            CURLOPT_RETURNTRANSFER => true,

            CURLOPT_HTTPHEADER => [
                'Authorization: Key ' . $this->secretKey,
                'Content-Type: application/json',
                'Accept: application/json'
            ],

            CURLOPT_POSTFIELDS => $jsonPayload,

            CURLOPT_TIMEOUT => 30,

            CURLOPT_CONNECTTIMEOUT => 10
        ]);

        $response = curl_exec($ch);

        if ($response === false) {

            $error = curl_error($ch);

            curl_close($ch);

            throw new RuntimeException(
                'Unable to connect to Paymob: ' . $error,
                502
            );
        }

        $httpCode = curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );

        curl_close($ch);

        $result = json_decode(
            $response,
            true
        );

        if (!is_array($result)) {
            throw new RuntimeException(
                'Invalid response received from Paymob',
                502
            );
        }

        if ($httpCode < 200 || $httpCode >= 300) {

            $message =
                $result['message']
                ?? $result['detail']
                ?? 'Paymob payment intention failed';

            throw new RuntimeException(
                $message,
                502
            );
        }

        return $result;
    }
    /**
     * إنشاء رابط Paymob Unified Checkout
     */
    public function getCheckoutUrl(string $clientSecret): string
    {
        if ($clientSecret === '') {
            throw new RuntimeException(
                'Paymob client secret is required',
                422
            );
        }

        return 'https://accept.paymob.com/unifiedcheckout/?publicKey='
            . urlencode($this->publicKey)
            . '&clientSecret='
            . urlencode($clientSecret);
    }
}
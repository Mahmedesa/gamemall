<?php

namespace App\Http\Controllers;

use App\Services\RentalService;
use App\Services\PaymobService;
use Exception;

class PaymobCallbackController
{
    private PaymobService $paymob;
    private RentalService $rentalService;

    public function __construct()
    {
        $this->paymob = new PaymobService();
        $this->rentalService = new RentalService();
    }

    /**
     * Handle Paymob Transaction Callback (Webhook)
     */
    public function handleProcessed(): void
    {
        header('Content-Type: application/json');

        try {
            // 1. قراءة البيانات القادمة من Paymob
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);

            if (!$data || !isset($data['obj'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid webhook payload']);
                return;
            }

            $obj = $data['obj'];
            $hmacHeader = $_SERVER['HTTP_HMAC'] ?? $_GET['hmac'] ?? '';

            // 2. التحقق من صحة التوقيع (HMAC Verification)
            if (!$this->paymob->verifyHmac($obj, $hmacHeader)) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'HMAC verification failed']);
                return;
            }

            // 3. التحقق من نجاح عملية الدفع
            $isSuccess = filter_var($obj['success'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $pending   = filter_var($obj['pending'] ?? false, FILTER_VALIDATE_BOOLEAN);

            // استخراج معرفات المعاملة والـ Order
            $transactionId = (string) ($obj['id'] ?? '');
            $orderId       = (string) ($obj['order']['id'] ?? '');

            if ($isSuccess && !$pending) {
                // تفعيل الـ Rental وتحديث حالة الدفع إلى PAID
                $this->rentalService->markRentPaymentAsPaidByOrderId($orderId, $transactionId);

                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Payment processed and rental activated']);
            } else {
                // في حالة فشل الدفع
                $this->rentalService->markRentPaymentAsFailedByOrderId($orderId, $transactionId);

                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Payment failed status recorded']);
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
<?php

namespace App\Controllers;

use App\Services\ReviewService;
use App\Core\Response;
use App\Core\Auth;
use RuntimeException;
use Throwable;

class ReviewController
{
    private ReviewService $reviewService;

    public function __construct()
    {
        $this->reviewService = new ReviewService();
    }

    private function getRequestData(): array
    {
        $input = file_get_contents('php://input');

        if (!$input) {
            return [];
        }

        $data = json_decode($input, true);

        if (!is_array($data)) {
            return [];
        }

        return $data;
    }

    private function resolveId(string $key): int
    {
        $value = $_GET[$key] ?? null;

        if (
            $value === null ||
            filter_var($value, FILTER_VALIDATE_INT) === false
        ) {
            throw new RuntimeException(
                "A valid {$key} is required",
                422
            );
        }

        return (int) $value;
    }

    private function resolveIdFromData(array $data, string $key): int
    {
        $value = $_GET[$key] ?? $data[$key] ?? null;

        if (
            $value === null ||
            filter_var($value, FILTER_VALIDATE_INT) === false
        ) {
            throw new RuntimeException(
                "A valid {$key} is required",
                422
            );
        }

        return (int) $value;
    }

    private function statusFromException(Throwable $e): int
    {
        $code = $e->getCode();

        if (in_array($code, [401, 403, 404, 422], true)) {
            return $code;
        }

        return 400;
    }

    /**
     * تقييمات منتج معين (عامة - بدون تسجيل دخول)
     * GET /api/reviews/product?product_id=1
     */
    public function byProduct(): void
    {
        try {

            $productId = $this->resolveId('product_id');

            $result = $this->reviewService->listByProduct($productId);

            Response::success(
                $result,
                'Product reviews fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * تقييمات محل معين (عامة - بدون تسجيل دخول)
     * GET /api/reviews/store?store_id=1
     */
    public function byStore(): void
    {
        try {

            $storeId = $this->resolveId('store_id');

            $result = $this->reviewService->listByStore($storeId);

            Response::success(
                $result,
                'Store reviews fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * تقييمات الكاستومر الحالي بنفسه
     * GET /api/customer/reviews
     */
    public function myReviews(): void
    {
        try {

            $authUser = Auth::user();

            $result = $this->reviewService->myReviews($authUser);

            Response::success(
                $result,
                'Your reviews fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * إضافة تقييم جديد (كاستومر بس، وبشرط شراء واستلام فعلي)
     * POST /api/customer/reviews  body: { "product_id": 1, "rating": 5, "review_title": "...", "review_text": "..." }
     */
    public function store(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $result = $this->reviewService->create($authUser, $data);

            Response::success(
                $result,
                'Review submitted successfully',
                201
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * تعديل تقييم
     * POST /api/customer/reviews/update  body: { "review_id": 1, "rating": 4, ... }
     */
    public function update(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $reviewId = $this->resolveIdFromData($data, 'review_id');

            $result = $this->reviewService->update(
                $authUser,
                $reviewId,
                $data
            );

            Response::success(
                $result,
                'Review updated successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * حذف تقييم
     * POST /api/customer/reviews/delete  body: { "review_id": 1 }
     */
    public function destroy(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $reviewId = $this->resolveIdFromData($data, 'review_id');

            $this->reviewService->delete($authUser, $reviewId);

            Response::success(
                [],
                'Review deleted successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }
}
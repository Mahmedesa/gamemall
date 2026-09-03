<?php

namespace App\Services;

use App\Models\Review;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\GameService;
use App\Core\Database;
use RuntimeException;

class ReviewService
{
    private Review $review;
    private Product $product;
    private Order $order;
    private OrderItem $orderItem;
    private GameService $gameService;

    public function __construct()
    {
        $this->review = new Review();
        $this->product = new Product();
        $this->order = new Order();
        $this->orderItem = new OrderItem();
        $this->gameService = new GameService();
    }

    /**
     * التأكد إن الحساب الحالي "customer" وإرجاع الـ cus_id بتاعه
     */
    private function currentCustomerId(array $authUser): int
    {
        if (($authUser['account_type'] ?? null) !== 'customer') {
            throw new RuntimeException(
                'Only customer accounts can write reviews',
                403
            );
        }

        $customerId = $authUser['customer_id'] ?? null;

        if (!$customerId) {
            throw new RuntimeException(
                'Customer account is not linked properly',
                403
            );
        }

        return (int) $customerId;
    }

    /**
     * التأكد إن الكاستومر فعلاً اشترى المنتج ده واستلمه
     * (عنده order_item للمنتج ده جوه أوردر بحالة DELIVERED)
     */
    private function hasDeliveredPurchase(
        int $customerId,
        int $productId
    ): bool {

        $orders = $this->order
            ->where('customer_id', '=', $customerId)
            ->where('order_status', '=', 'DELIVERED')
            ->get();

        if (empty($orders)) {
            return false;
        }

        foreach ($orders as $order) {

            $exists = $this->orderItem
                ->where('order_id', '=', $order['order_id'])
                ->where('product_id', '=', $productId)
                ->exists();

            if ($exists) {
                return true;
            }
        }

        return false;
    }

    /**
     * التأكد إن التقييم موجود وملك الكاستومر الحالي، وإرجاعه
     */
    private function assertOwnedByCustomer(
        int $reviewId,
        int $customerId
    ): array {

        $review = $this->review->find($reviewId);

        if (!$review || (int) $review['is_deleted'] === 1) {
            throw new RuntimeException(
                'Review not found',
                404
            );
        }

        if ((int) $review['cus_id'] !== $customerId) {
            throw new RuntimeException(
                'You are not authorized to modify this review',
                403
            );
        }

        return $review;
    }

    /**
     * كل تقييمات منتج معين (عامة - أي حد يشوفها) + متوسط التقييم
     */
    public function listByProduct(int $productId): array
    {
        $reviews = $this->review
            ->where('product_id', '=', $productId)
            ->where('is_deleted', '=', 0)
            ->where('is_active', '=', 1)
            ->where('is_approved', '=', 1)
            ->orderBy('created_at', 'DESC')
            ->get();

        return $this->buildReviewSummary($reviews);
    }

    /**
     * كل تقييمات محل معين (عامة) + متوسط التقييم
     */
    public function listByStore(int $storeId): array
    {
        $reviews = $this->review
            ->where('store_id', '=', $storeId)
            ->where('is_deleted', '=', 0)
            ->where('is_active', '=', 1)
            ->where('is_approved', '=', 1)
            ->orderBy('created_at', 'DESC')
            ->get();

        return $this->buildReviewSummary($reviews);
    }

    /**
     * تجميع التقييمات مع حساب المتوسط وعدد كل نجمة
     */
    private function buildReviewSummary(array $reviews): array
    {
        $count = count($reviews);
        $sum = 0;

        $breakdown = [
            1 => 0,
            2 => 0,
            3 => 0,
            4 => 0,
            5 => 0
        ];

        foreach ($reviews as $review) {

            $rating = (int) $review['rating'];
            $sum += $rating;

            if (isset($breakdown[$rating])) {
                $breakdown[$rating]++;
            }
        }

        return [
            'reviews' => $reviews,
            'reviews_count' => $count,
            'average_rating' => $count > 0
                ? round($sum / $count, 2)
                : 0,
            'rating_breakdown' => $breakdown
        ];
    }

    /**
     * تقييمات الكاستومر الحالي بنفسه
     */
    public function myReviews(array $authUser): array
    {
        $customerId = $this->currentCustomerId($authUser);

        return $this->review
            ->where('cus_id', '=', $customerId)
            ->where('is_deleted', '=', 0)
            ->orderBy('created_at', 'DESC')
            ->get();
    }

    /**
     * إضافة تقييم جديد - بشرط إن الكاستومر فعلاً اشترى المنتج
     * واستلمه (أوردر بحالة DELIVERED)
     */
    public function create(array $authUser, array $data): array
    {
        $customerId = $this->currentCustomerId($authUser);

        $productId = $data['product_id'] ?? null;

        if (
            $productId === null ||
            filter_var($productId, FILTER_VALIDATE_INT) === false
        ) {
            throw new RuntimeException(
                'A valid product_id is required',
                422
            );
        }

        $productId = (int) $productId;

        $rating = $data['rating'] ?? null;

        if (
            $rating === null ||
            filter_var($rating, FILTER_VALIDATE_INT) === false ||
            (int) $rating < 1 ||
            (int) $rating > 5
        ) {
            throw new RuntimeException(
                'Rating must be an integer between 1 and 5',
                422
            );
        }

        $rating = (int) $rating;

        $product = $this->product->find($productId);

        if (!$product) {
            throw new RuntimeException(
                'Product not found',
                404
            );
        }

        $storeId = (int) $product['store_id'];

        /*
         * القاعدة الأساسية: الكاستومر ميقدرش يقيّم منتج إلا لو
         * فعلاً اشتراه واستلمه (أوردر بحالة DELIVERED)
         */
        if (!$this->hasDeliveredPurchase($customerId, $productId)) {
            throw new RuntimeException(
                'You can only review products you have purchased ' .
                    'and received',
                403
            );
        }

        /*
         * منع التقييم المكرر لنفس المنتج من نفس الكاستومر
         * (فيه UNIQUE KEY في الداتا بيز على store_id+product_id+cus_id)
         */
        $alreadyReviewed = $this->review
            ->where('store_id', '=', $storeId)
            ->where('product_id', '=', $productId)
            ->where('cus_id', '=', $customerId)
            ->exists();

        if ($alreadyReviewed) {
            throw new RuntimeException(
                'You have already reviewed this product',
                422
            );
        }

        $reviewTitle = isset($data['review_title'])
            ? trim((string) $data['review_title'])
            : null;

        $reviewText = isset($data['review_text'])
            ? trim((string) $data['review_text'])
            : null;

        $db = Database::connection();

        $this->review->create([
            'store_id' => $storeId,
            'product_id' => $productId,
            'cus_id' => $customerId,
            'rating' => $rating,
            'review_title' => $reviewTitle !== '' ? $reviewTitle : null,
            'review_text' => $reviewText !== '' ? $reviewText : null,
            'is_verified_purchase' => 1,
            'is_approved' => 1,
            'is_active' => 1,
            'is_deleted' => 0
        ]);

        $reviewId = (int) $db->lastInsertId();

        /*
         * مكافأة XP + Coins للكاستومر مقابل كتابة تقييم
         */
        $this->gameService->rewardReviewSubmitted($customerId, $reviewId);

        return $this->review->find($reviewId);
    }

    /**
     * تعديل تقييم (لازم يكون ملك الكاستومر الحالي)
     */
    public function update(
        array $authUser,
        int $reviewId,
        array $data
    ): array {

        $customerId = $this->currentCustomerId($authUser);

        $this->assertOwnedByCustomer($reviewId, $customerId);

        $updateData = [];

        if (array_key_exists('rating', $data)) {

            $rating = $data['rating'];

            if (
                filter_var($rating, FILTER_VALIDATE_INT) === false ||
                (int) $rating < 1 ||
                (int) $rating > 5
            ) {
                throw new RuntimeException(
                    'Rating must be an integer between 1 and 5',
                    422
                );
            }

            $updateData['rating'] = (int) $rating;
        }

        if (array_key_exists('review_title', $data)) {
            $updateData['review_title'] =
                trim((string) $data['review_title']) ?: null;
        }

        if (array_key_exists('review_text', $data)) {
            $updateData['review_text'] =
                trim((string) $data['review_text']) ?: null;
        }

        if (!empty($updateData)) {
            $this->review->update($reviewId, $updateData);
        }

        return $this->review->find($reviewId);
    }

    /**
     * حذف (soft delete) تقييم - لازم يكون ملك الكاستومر الحالي
     */
    public function delete(array $authUser, int $reviewId): bool
    {
        $customerId = $this->currentCustomerId($authUser);

        $this->assertOwnedByCustomer($reviewId, $customerId);

        return (bool) $this->review->update(
            $reviewId,
            [
                'is_deleted' => 1,
                'is_active' => 0
            ]
        );
    }
}
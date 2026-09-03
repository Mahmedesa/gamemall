<?php

namespace App\Services;

use App\Models\PlayerProfile;
use App\Models\XpTransaction;
use App\Models\Achievement;
use App\Models\UserAchievement;
use App\Models\Order;
use App\Models\Review;
use App\Core\Database;
use RuntimeException;

class GameService
{
    private PlayerProfile $profile;
    private XpTransaction $xpTransaction;
    private Achievement $achievement;
    private UserAchievement $userAchievement;
    private Order $order;
    private Review $review;

    /**
     * أكواد مصادر الـ XP (مفيش جدول lookup ليها في الداتا بيز،
     * فبنستخدمها ثابتة هنا في الكود)
     */
    public const SOURCE_ORDER_DELIVERED = 1;
    public const SOURCE_REVIEW_SUBMITTED = 2;
    public const SOURCE_ACHIEVEMENT_UNLOCKED = 3;

    /**
     * قيم المكافآت الثابتة لكل حدث
     */
    private const REWARDS = [
        self::SOURCE_ORDER_DELIVERED => [
            'xp' => 50,
            'coins' => 10,
            'name' => 'Order Delivered'
        ],
        self::SOURCE_REVIEW_SUBMITTED => [
            'xp' => 20,
            'coins' => 5,
            'name' => 'Review Submitted'
        ]
    ];

    /**
     * كل 100 XP = مستوى واحد
     */
    private const XP_PER_LEVEL = 100;

    public function __construct()
    {
        $this->profile = new PlayerProfile();
        $this->xpTransaction = new XpTransaction();
        $this->achievement = new Achievement();
        $this->userAchievement = new UserAchievement();
        $this->order = new Order();
        $this->review = new Review();
    }

    private function currentCustomerId(array $authUser): int
    {
        if (($authUser['account_type'] ?? null) !== 'customer') {
            throw new RuntimeException(
                'Only customer accounts have a player profile',
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
     * جلب بروفايل اللاعب، أو إنشاء واحد جديد لو معندوش
     */
    private function getOrCreateProfile(int $customerId): array
    {
        $profile = $this->profile
            ->where('cus_id', '=', $customerId)
            ->first();

        if ($profile) {
            return $profile;
        }

        $db = Database::connection();

        $this->profile->create([
            'cus_id' => $customerId,
            'player_level' => 1,
            'xp_id' => null,
            'coins' => 0,
            'gems' => 0,
            'avatar' => null
        ]);

        $profileId = (int) $db->lastInsertId();

        return $this->profile->find($profileId);
    }

    /**
     * حساب إجمالي الـ XP اللي الكاستومر جمعه لحد دلوقتي، عن طريق
     * تجميع كل الـ transactions بتاعته حسب نوع المصدر
     */
    private function calculateTotalXp(int $customerId): int
    {
        $transactions = $this->xpTransaction
            ->where('cus_id', '=', $customerId)
            ->get();

        $total = 0;

        foreach ($transactions as $tx) {

            $source = (int) ($tx['source'] ?? 0);

            if ($source === self::SOURCE_ACHIEVEMENT_UNLOCKED) {

                /*
                 * لو المصدر إنجاز، نجيب قيمة الـ XP من جدول
                 * الإنجازات نفسه عن طريق reference_id (achievement_id)
                 */
                $achievementId = (int) ($tx['reference_id'] ?? 0);
                $achievement = $this->achievement->find($achievementId);

                $total += (int) ($achievement['xp_reward'] ?? 0);

            } elseif (isset(self::REWARDS[$source])) {

                $total += self::REWARDS[$source]['xp'];
            }
        }

        return $total;
    }

    /**
     * تسجيل حدث XP جديد للكاستومر، وتحديث بروفايله (coins + level)
     */
    public function awardXp(
        int $customerId,
        int $source,
        int $referenceId,
        int $xpAmount,
        int $coinAmount,
        string $xpName
    ): void {

        $db = Database::connection();

        $this->getOrCreateProfile($customerId);

        $this->xpTransaction->create([
            'cus_id' => $customerId,
            'xp_name' => $xpName,
            'source' => $source,
            'reference_id' => $referenceId
        ]);

        $xpId = (int) $db->lastInsertId();

        $totalXp = $this->calculateTotalXp($customerId);
        $newLevel = intdiv($totalXp, self::XP_PER_LEVEL) + 1;

        $profile = $this->profile
            ->where('cus_id', '=', $customerId)
            ->first();

        $this->profile->update(
            $profile['player_id'],
            [
                'xp_id' => $xpId,
                'coins' => (int) ($profile['coins'] ?? 0) + $coinAmount,
                'player_level' => $newLevel
            ]
        );
    }

    /**
     * مكافأة العميل عند استلام أوردر (DELIVERED) بنجاح
     */
    public function rewardOrderDelivered(int $customerId, int $orderId): void
    {
        $reward = self::REWARDS[self::SOURCE_ORDER_DELIVERED];

        $this->awardXp(
            $customerId,
            self::SOURCE_ORDER_DELIVERED,
            $orderId,
            $reward['xp'],
            $reward['coins'],
            $reward['name']
        );

        $this->checkAndUnlockAchievements($customerId);
    }

    /**
     * مكافأة العميل عند كتابة تقييم
     */
    public function rewardReviewSubmitted(int $customerId, int $reviewId): void
    {
        $reward = self::REWARDS[self::SOURCE_REVIEW_SUBMITTED];

        $this->awardXp(
            $customerId,
            self::SOURCE_REVIEW_SUBMITTED,
            $reviewId,
            $reward['xp'],
            $reward['coins'],
            $reward['name']
        );

        $this->checkAndUnlockAchievements($customerId);
    }

    /**
     * التحقق من كل الإنجازات المعروفة، وفتح أي إنجاز جديد استوفى شرطه
     */
    private function checkAndUnlockAchievements(int $customerId): void
    {
        $deliveredOrdersCount = $this->order
            ->where('customer_id', '=', $customerId)
            ->where('order_status', '=', 'DELIVERED')
            ->count();

        $reviewsCount = $this->review
            ->where('cus_id', '=', $customerId)
            ->where('is_deleted', '=', 0)
            ->count();

        /*
         * تعريف شروط الإنجازات الأساسية (متزروعة بالـ ID في migration)
         * 1 = أول عملية شراء (أول أوردر DELIVERED)
         * 2 = ناقد نشيط (3 تقييمات فأكتر)
         * 3 = متسوق مخلص (5 أوردرات DELIVERED فأكتر)
         */
        $conditions = [
            1 => $deliveredOrdersCount >= 1,
            2 => $reviewsCount >= 3,
            3 => $deliveredOrdersCount >= 5
        ];

        foreach ($conditions as $achievementId => $isMet) {

            if (!$isMet) {
                continue;
            }

            $alreadyUnlocked = $this->userAchievement
                ->where('cus_id', '=', $customerId)
                ->where('achievement_id', '=', $achievementId)
                ->exists();

            if ($alreadyUnlocked) {
                continue;
            }

            $achievement = $this->achievement->find($achievementId);

            if (!$achievement) {
                continue;
            }

            $this->userAchievement->create([
                'cus_id' => $customerId,
                'achievement_id' => $achievementId,
                'unlocked_at' => date('Y-m-d H:i:s')
            ]);

            $this->awardXp(
                $customerId,
                self::SOURCE_ACHIEVEMENT_UNLOCKED,
                $achievementId,
                (int) ($achievement['xp_reward'] ?? 0),
                (int) ($achievement['coin_reward'] ?? 0),
                'Achievement Unlocked: ' .
                    ($achievement['achievements_name'] ?? '')
            );
        }
    }

    /**
     * عرض بروفايل اللاعب الحالي (بيتعمل له إنشاء تلقائي لو مش موجود)
     */
    public function getProfile(array $authUser): array
    {
        $customerId = $this->currentCustomerId($authUser);

        return $this->getOrCreateProfile($customerId);
    }

    /**
     * تعديل الأفاتار بتاع اللاعب
     */
    public function updateAvatar(array $authUser, string $avatar): array
    {
        $customerId = $this->currentCustomerId($authUser);

        $profile = $this->getOrCreateProfile($customerId);

        $this->profile->update(
            $profile['player_id'],
            ['avatar' => $avatar]
        );

        return $this->profile->find($profile['player_id']);
    }

    /**
     * سجل كل حركات الـ XP بتاعة الكاستومر الحالي
     */
    public function getXpHistory(array $authUser): array
    {
        $customerId = $this->currentCustomerId($authUser);

        return $this->xpTransaction
            ->where('cus_id', '=', $customerId)
            ->orderBy('xp_id', 'DESC')
            ->get();
    }

    /**
     * كل الإنجازات المعرّفة في النظام (عامة)
     */
    public function listAllAchievements(): array
    {
        return $this->achievement->where('achievement_id', '>', 0)->get();
    }

    /**
     * الإنجازات اللي الكاستومر الحالي فتحها
     */
    public function getMyAchievements(array $authUser): array
    {
        $customerId = $this->currentCustomerId($authUser);

        $unlocked = $this->userAchievement
            ->where('cus_id', '=', $customerId)
            ->orderBy('unlocked_at', 'DESC')
            ->get();

        foreach ($unlocked as &$row) {

            $achievement = $this->achievement->find(
                (int) $row['achievement_id']
            );

            $row['achievement'] = $achievement;
        }

        return $unlocked;
    }
}
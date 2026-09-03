<?php

namespace App\Controllers;

use App\Services\GameService;
use App\Core\Response;
use App\Core\Auth;
use RuntimeException;
use Throwable;

class GameController
{
    private GameService $gameService;

    public function __construct()
    {
        $this->gameService = new GameService();
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

    private function statusFromException(Throwable $e): int
    {
        $code = $e->getCode();

        if (in_array($code, [401, 403, 404, 422], true)) {
            return $code;
        }

        return 400;
    }

    /**
     * بروفايل اللاعب الحالي (level, coins, gems, avatar)
     * GET /api/customer/player-profile
     */
    public function profile(): void
    {
        try {

            $authUser = Auth::user();

            $result = $this->gameService->getProfile($authUser);

            Response::success(
                $result,
                'Player profile fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * تعديل الأفاتار
     * POST /api/customer/player-profile/avatar  body: { "avatar": "avatar_url_or_code" }
     */
    public function updateAvatar(): void
    {
        try {

            $authUser = Auth::user();

            $data = $this->getRequestData();

            $avatar = trim((string) ($data['avatar'] ?? ''));

            if ($avatar === '') {
                throw new RuntimeException(
                    'avatar is required',
                    422
                );
            }

            $result = $this->gameService->updateAvatar($authUser, $avatar);

            Response::success(
                $result,
                'Avatar updated successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * سجل حركات الـ XP
     * GET /api/customer/xp-history
     */
    public function xpHistory(): void
    {
        try {

            $authUser = Auth::user();

            $result = $this->gameService->getXpHistory($authUser);

            Response::success(
                $result,
                'XP history fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * كل الإنجازات المعرّفة في اللعبة (عامة)
     * GET /api/achievements
     */
    public function allAchievements(): void
    {
        try {

            $result = $this->gameService->listAllAchievements();

            Response::success(
                $result,
                'Achievements fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }

    /**
     * الإنجازات اللي الكاستومر الحالي فتحها
     * GET /api/customer/achievements
     */
    public function myAchievements(): void
    {
        try {

            $authUser = Auth::user();

            $result = $this->gameService->getMyAchievements($authUser);

            Response::success(
                $result,
                'Your achievements fetched successfully'
            );

        } catch (Throwable $e) {

            Response::error(
                $e->getMessage(),
                $this->statusFromException($e)
            );
        }
    }
}
<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait TracksUserOnlineStatus
{
    /**
     * Mark user as online
     *
     * @param string $userId
     * @return void
     */
    public static function markUserOnline(string $userId): void
    {
        // Cache user online status for 30 minutes
        Cache::put("user.{$userId}.online", true, now()->addMinutes(30));
    }

    /**
     * Mark user as offline
     *
     * @param string $userId
     * @return void
     */
    public static function markUserOffline(string $userId): void
    {
        Cache::forget("user.{$userId}.online");
    }

    /**
     * Check if user is online
     *
     * @param string $userId
     * @return bool
     */
    public static function isUserOnline(string $userId): bool
    {
        return Cache::has("user.{$userId}.online");
    }

    /**
     * Get online status for multiple users
     *
     * @param array $userIds
     * @return array
     */
    public static function getUsersOnlineStatus(array $userIds): array
    {
        $status = [];
        foreach ($userIds as $userId) {
            $status[$userId] = self::isUserOnline($userId);
        }
        return $status;
    }
}

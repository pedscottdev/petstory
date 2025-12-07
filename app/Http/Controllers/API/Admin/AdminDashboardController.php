<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Follow;
use App\Models\Pet;
use App\Models\PetLike;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    /**
     * Get dashboard statistics including totals, monthly changes, and top users/pets.
     *
     * @return JsonResponse
     */
    public function getStats(): JsonResponse
    {
        // Define date ranges
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // ========================================
        // 1. Total Posts Statistics
        // ========================================
        $totalPosts = Post::count();
        $postsThisMonth = Post::where('created_at', '>=', $startOfMonth)->count();
        $postsLastMonth = Post::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $postsPercentChange = $this->calculatePercentChange($postsThisMonth, $postsLastMonth);

        // ========================================
        // 2. Total Users Statistics
        // ========================================
        $totalUsers = User::count();
        $usersThisMonth = User::where('created_at', '>=', $startOfMonth)->count();
        $usersLastMonth = User::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $usersPercentChange = $this->calculatePercentChange($usersThisMonth, $usersLastMonth);

        // ========================================
        // 3. Violations (Reports) This Month
        // ========================================
        $violationsThisMonth = Report::where('created_at', '>=', $startOfMonth)->count();
        $violationsLastMonth = Report::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $violationsPercentChange = $this->calculatePercentChange($violationsThisMonth, $violationsLastMonth);

        // ========================================
        // 4. New Users This Month
        // ========================================
        $newUsersThisMonth = $usersThisMonth;
        $newUsersPercentChange = $usersPercentChange;

        // ========================================
        // 5. Top 5 Users with Most Followers
        // ========================================
        $topUsers = $this->getTopUsersWithMostFollowers(5);

        // ========================================
        // 6. Top 5 Pets with Most Likes
        // ========================================
        $topPets = $this->getTopPetsWithMostLikes(5);

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'totalPosts' => $totalPosts,
                    'postsPercentChange' => $postsPercentChange,
                    'totalUsers' => $totalUsers,
                    'usersPercentChange' => $usersPercentChange,
                    'violationsThisMonth' => $violationsThisMonth,
                    'violationsPercentChange' => $violationsPercentChange,
                    'newUsersThisMonth' => $newUsersThisMonth,
                    'newUsersPercentChange' => $newUsersPercentChange,
                ],
                'topUsers' => $topUsers,
                'topPets' => $topPets,
            ],
        ]);
    }

    /**
     * Calculate percentage change between current and previous period.
     *
     * @param int $current
     * @param int $previous
     * @return float
     */
    private function calculatePercentChange(int $current, int $previous): float
    {
        if ($previous === 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Get top users with the most followers.
     *
     * @param int $limit
     * @return array
     */
    private function getTopUsersWithMostFollowers(int $limit = 5): array
    {
        // Aggregate follower counts from follows collection
        $followerCounts = Follow::raw(function ($collection) use ($limit) {
            return $collection->aggregate([
                [
                    '$group' => [
                        '_id' => '$following_id',
                        'followerCount' => ['$sum' => 1],
                    ],
                ],
                [
                    '$sort' => ['followerCount' => -1],
                ],
                [
                    '$limit' => $limit,
                ],
            ]);
        });

        $topUsers = [];
        foreach ($followerCounts as $item) {
            $userId = $item->_id;
            $followerCount = $item->followerCount;

            $user = User::find($userId);
            if ($user) {
                $topUsers[] = [
                    'id' => (string) $user->_id,
                    'name' => $user->full_name ?? ($user->first_name . ' ' . $user->last_name),
                    'avatar' => $user->avatar_url,
                    'followers' => $followerCount,
                ];
            }
        }

        return $topUsers;
    }

    /**
     * Get top pets with the most likes.
     *
     * @param int $limit
     * @return array
     */
    private function getTopPetsWithMostLikes(int $limit = 5): array
    {
        // Aggregate like counts from pet_likes collection
        $likeCounts = PetLike::raw(function ($collection) use ($limit) {
            return $collection->aggregate([
                [
                    '$group' => [
                        '_id' => '$pet_id',
                        'likeCount' => ['$sum' => 1],
                    ],
                ],
                [
                    '$sort' => ['likeCount' => -1],
                ],
                [
                    '$limit' => $limit,
                ],
            ]);
        });

        $topPets = [];
        foreach ($likeCounts as $item) {
            $petId = $item->_id;
            $likeCount = $item->likeCount;

            $pet = Pet::find($petId);
            if ($pet) {
                $topPets[] = [
                    'id' => (string) $pet->_id,
                    'name' => $pet->name,
                    'avatar' => $pet->avatar_url,
                    'likes' => $likeCount,
                ];
            }
        }

        return $topPets;
    }
}

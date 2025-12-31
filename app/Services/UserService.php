<?php

namespace App\Services;

use App\Models\User;
use App\Models\Pet;
use App\Models\Follow;
use App\Models\PetLike;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserService
{
    /**
     * Get user by ID with pets information
     *
     * @param string $userId
     * @return User|null
     */
    public function getUserWithPets(string $userId)
    {
        return User::with('pets:id,owner_id,name,avatar_url')->find($userId);
    }

    /**
     * Get user profile with follow information
     *
     * @param string $userId
     * @param string|null $currentUserId
     * @return array
     */
    public function getUserProfile(string $userId, ?string $currentUserId = null): array
    {
        $user = User::with('pets:id,owner_id,name,avatar_url')->find($userId);
        
        if (!$user) {
            return [];
        }

        // Get follow counts
        $followersCount = Follow::where('following_id', $userId)->count();
        $followingCount = Follow::where('follower_id', $userId)->count();

        // Check if current user is following this user
        $isFollowing = false;
        if ($currentUserId && $currentUserId !== $userId) {
            $isFollowing = Follow::where('follower_id', $currentUserId)
                ->where('following_id', $userId)
                ->exists();
        }

        return [
            'user' => $user,
            'followers_count' => $followersCount,
            'following_count' => $followingCount,
            'is_following' => $isFollowing
        ];
    }

    /**
     * Get all users with pagination and optional search
     *
     * @param int $page
     * @param int $perPage
     * @param string $search
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAllUsers(int $page = 1, int $perPage = 15, string $search = '')
    {
        $query = User::with('pets:id,owner_id,name,avatar_url');

        // Apply search filter if provided
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get prominent users based on followers count and total pet likes
     *
     * @param string $currentUserId
     * @param int $limit
     * @return array
     */
    public function getProminentUsers(string $currentUserId, int $limit = 3): array
    {
        // Get all regular users (exclude admins and current user)
        $users = User::with('pets')
            ->where('role', 'user')
            ->where('_id', '!=', $currentUserId)
            ->get();
        
        if ($users->isEmpty()) {
            return [];
        }
        
        // Batch fetch all follow counts
        $userIds = $users->pluck('id')->toArray();
        
        // Check which users current user is following - batch query
        $currentUserFollowing = Follow::where('follower_id', $currentUserId)
            ->whereIn('following_id', $userIds)
            ->pluck('following_id')
            ->toArray();
        
        // Count followers for each user - batch query
        $followersData = Follow::whereIn('following_id', $userIds)->get();
        $followersMap = [];
        foreach ($followersData as $follow) {
            $followingId = $follow->following_id;
            if (!isset($followersMap[$followingId])) {
                $followersMap[$followingId] = 0;
            }
            $followersMap[$followingId]++;
        }
        
        // Count following for each user - batch query
        $followingData = Follow::whereIn('follower_id', $userIds)->get();
        $followingMap = [];
        foreach ($followingData as $follow) {
            $followerId = $follow->follower_id;
            if (!isset($followingMap[$followerId])) {
                $followingMap[$followerId] = 0;
            }
            $followingMap[$followerId]++;
        }
        
        // Batch fetch all pet IDs
        $petIds = $users->flatMap(function($user) {
            return $user->pets->pluck('id');
        })->toArray();
        
        // Batch fetch pet likes only if there are pets
        $petLikesMap = [];
        if (!empty($petIds)) {
            $petLikesData = PetLike::whereIn('pet_id', $petIds)->get();
            foreach ($petLikesData as $like) {
                $petId = $like->pet_id;
                if (!isset($petLikesMap[$petId])) {
                    $petLikesMap[$petId] = 0;
                }
                $petLikesMap[$petId]++;
            }
        }
        
        // Batch fetch posts count
        $postsData = Post::whereIn('author_id', $userIds)->get();
        $postsMap = [];
        foreach ($postsData as $post) {
            $authorId = $post->author_id;
            if (!isset($postsMap[$authorId])) {
                $postsMap[$authorId] = 0;
            }
            $postsMap[$authorId]++;
        }
        
        // Calculate scores for each user
        $userScores = [];
        foreach ($users as $user) {
            $followersCount = $followersMap[$user->id] ?? 0;
            $followingCount = $followingMap[$user->id] ?? 0;
            
            // Count total pet likes for this user
            $totalPetLikes = 0;
            foreach ($user->pets as $pet) {
                $totalPetLikes += $petLikesMap[$pet->id] ?? 0;
            }
            
            // Combined score (followers + pet likes)
            $score = $followersCount + $totalPetLikes;
            
            $userScores[] = [
                'user' => $user,
                'followers_count' => $followersCount,
                'following_count' => $followingCount,
                'total_pet_likes' => $totalPetLikes,
                'posts_count' => $postsMap[$user->id] ?? 0,
                'score' => $score
            ];
        }
        
        // Sort by score descending
        usort($userScores, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });
        
        // If we don't have enough prominent users (with score > 0), fill with random users
        $prominentUsers = array_filter($userScores, function($userScore) {
            return $userScore['score'] > 0;
        });
        
        $result = array_slice($prominentUsers, 0, $limit);
        
        // Fill with random users if needed (excluding current user)
        if (count($result) < $limit) {
            $remainingCount = $limit - count($result);
            $usedIds = array_map(function($item) {
                return $item['user']->id;
            }, $result);
            
            $randomUsers = array_filter($userScores, function($userScore) use ($usedIds) {
                return !in_array($userScore['user']->id, $usedIds);
            });
            
            // Shuffle and take remaining
            shuffle($randomUsers);
            $result = array_merge($result, array_slice($randomUsers, 0, $remainingCount));
        }
        
        // Format response
        return array_map(function($userScore) use ($currentUserFollowing) {
            return [
                'id' => $userScore['user']->id,
                'first_name' => $userScore['user']->first_name,
                'last_name' => $userScore['user']->last_name,
                'email' => $userScore['user']->email,
                'avatar_url' => $userScore['user']->avatar_url,
                'followers_count' => $userScore['followers_count'],
                'following_count' => $userScore['following_count'],
                'total_pet_likes' => $userScore['total_pet_likes'],
                'posts_count' => $userScore['posts_count'],
                'is_followed' => in_array($userScore['user']->id, $currentUserFollowing),
                'pets' => $userScore['user']->pets->map(function($pet) {
                    return [
                        'id' => $pet->id,
                        'name' => $pet->name,
                        'avatar_url' => $pet->avatar_url
                    ];
                })->toArray()
            ];
        }, $result);
    }

    /**
     * Get people you may know based on followers of your followings
     *
     * @param string $userId
     * @param int $limit
     * @return array
     */
    public function getPeopleYouMayKnow(string $userId, int $limit = 10): array
    {
        // Get IDs of users that current user is already following
        $currentUserFollowing = Follow::where('follower_id', $userId)->pluck('following_id')->toArray();
        $followingIds = $currentUserFollowing;
        $followingIds[] = $userId; // Don't suggest self
        
        // Get users that are followed by people the current user is following
        $mayKnowIds = Follow::whereIn('follower_id', $followingIds)
            ->whereNotIn('following_id', $followingIds)
            ->select('following_id')
            ->distinct()
            ->limit($limit * 2) // Get more to account for filtering
            ->pluck('following_id')
            ->toArray();
        
        // Get the actual users with their pets
        $mayKnowUsers = User::with('pets:id,owner_id,name,avatar_url')
            ->whereIn('_id', $mayKnowIds)
            ->where('role', 'user')
            ->limit($limit)
            ->get();
        
        // If not enough users, fill with random users
        if ($mayKnowUsers->count() < $limit) {
            $remainingCount = $limit - $mayKnowUsers->count();
            $excludeIds = array_merge($followingIds, $mayKnowUsers->pluck('id')->toArray());
            
            // Get more users than needed and shuffle
            $randomUsers = User::with('pets:id,owner_id,name,avatar_url')
                ->whereNotIn('_id', $excludeIds)
                ->where('role', 'user')
                ->limit($remainingCount * 2) // Get 2x more for better randomization
                ->get()
                ->shuffle()
                ->take($remainingCount);
            
            $mayKnowUsers = $mayKnowUsers->merge($randomUsers);
        }
        
        // Batch fetch all counts to avoid N+1 queries
        $userIds = $mayKnowUsers->pluck('id')->toArray();
        
        // Count followers for each user - batch query
        $followersData = Follow::whereIn('following_id', $userIds)->get();
        $followersMap = [];
        foreach ($followersData as $follow) {
            $followingId = $follow->following_id;
            if (!isset($followersMap[$followingId])) {
                $followersMap[$followingId] = 0;
            }
            $followersMap[$followingId]++;
        }
        
        // Count following for each user - batch query
        $followingData = Follow::whereIn('follower_id', $userIds)->get();
        $followingMap = [];
        foreach ($followingData as $follow) {
            $followerId = $follow->follower_id;
            if (!isset($followingMap[$followerId])) {
                $followingMap[$followerId] = 0;
            }
            $followingMap[$followerId]++;
        }
        
        // Batch fetch posts count
        $postsData = Post::whereIn('author_id', $userIds)->get();
        $postsMap = [];
        foreach ($postsData as $post) {
            $authorId = $post->author_id;
            if (!isset($postsMap[$authorId])) {
                $postsMap[$authorId] = 0;
            }
            $postsMap[$authorId]++;
        }
            
        return $mayKnowUsers->map(function($user) use ($followersMap, $followingMap, $postsMap, $currentUserFollowing) {
            return [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'followers_count' => $followersMap[$user->id] ?? 0,
                'following_count' => $followingMap[$user->id] ?? 0,
                'posts_count' => $postsMap[$user->id] ?? 0,
                'is_followed' => in_array($user->id, $currentUserFollowing),
                'pets' => $user->pets->map(function($pet) {
                    return [
                        'id' => $pet->id,
                        'name' => $pet->name,
                        'avatar_url' => $pet->avatar_url
                    ];
                })->toArray()
            ];
        })->toArray();
    }

    /**
     * Update user profile
     *
     * @param string $userId
     * @param array $data
     * @return User
     */
    public function updateUserProfile(string $userId, array $data): User
    {
        $user = User::findOrFail($userId);
        
        // Only update allowed fields
        $allowedFields = ['first_name', 'last_name', 'bio', 'avatar_url'];
        $updateData = array_intersect_key($data, array_flip($allowedFields));
        
        $user->update($updateData);
        
        return $user;
    }

    /**
     * Change user password
     *
     * @param string $userId
     * @param string $currentPassword
     * @param string $newPassword
     * @return bool
     */
    public function changePassword(string $userId, string $currentPassword, string $newPassword): bool
    {
        $user = User::findOrFail($userId);
        
        // Check current password
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }
        
        // Update with new password
        $user->update([
            'password' => Hash::make($newPassword)
        ]);
        
        return true;
    }

    /**
     * Get user suggestions (users not followed by current user)
     *
     * @param string $userId
     * @param int $limit
     * @return array
     */
    public function getUserSuggestions(string $userId, int $limit = 10): array
    {
        // Get IDs of users that current user is already following
        $followingIds = Follow::where('follower_id', $userId)->pluck('following_id')->toArray();
        $followingIds[] = $userId; // Don't suggest self
        
        // Get suggested users with their pets - get more than needed for randomization
        $suggestedUsers = User::with('pets:id,owner_id,name,avatar_url')
            ->whereNotIn('_id', $followingIds)
            ->where('role', 'user')
            ->limit($limit * 3) // Get 3x more for better randomization
            ->get();
        
        // Shuffle and take only what we need
        $suggestedUsers = $suggestedUsers->shuffle()->take($limit);
        
        // Batch fetch all counts to avoid N+1 queries
        $userIds = $suggestedUsers->pluck('id')->toArray();
        
        // Count followers for each user - batch query
        $followersData = Follow::whereIn('following_id', $userIds)->get();
        $followersMap = [];
        foreach ($followersData as $follow) {
            $followingId = $follow->following_id;
            if (!isset($followersMap[$followingId])) {
                $followersMap[$followingId] = 0;
            }
            $followersMap[$followingId]++;
        }
        
        // Count following for each user - batch query
        $followingData = Follow::whereIn('follower_id', $userIds)->get();
        $followingMap = [];
        foreach ($followingData as $follow) {
            $followerId = $follow->follower_id;
            if (!isset($followingMap[$followerId])) {
                $followingMap[$followerId] = 0;
            }
            $followingMap[$followerId]++;
        }
        
        // Batch fetch posts count
        $postsData = Post::whereIn('author_id', $userIds)->get();
        $postsMap = [];
        foreach ($postsData as $post) {
            $authorId = $post->author_id;
            if (!isset($postsMap[$authorId])) {
                $postsMap[$authorId] = 0;
            }
            $postsMap[$authorId]++;
        }
            
        return $suggestedUsers->map(function($user) use ($followersMap, $followingMap, $postsMap) {
            return [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'followers_count' => $followersMap[$user->id] ?? 0,
                'following_count' => $followingMap[$user->id] ?? 0,
                'posts_count' => $postsMap[$user->id] ?? 0,
                'pets' => $user->pets->map(function($pet) {
                    return [
                        'id' => $pet->id,
                        'name' => $pet->name,
                        'avatar_url' => $pet->avatar_url
                    ];
                })->toArray()
            ];
        })->toArray();
    }

    /**
     * Get followers for a user
     *
     * @param string $userId
     * @param int $limit
     * @return array
     */
    public function getFollowers(string $userId, int $limit = 20): array
    {
        $follows = Follow::with('follower.pets:id,owner_id,name,avatar_url')
            ->where('following_id', $userId)
            ->limit($limit)
            ->get();
        
        $followers = $follows->pluck('follower')->filter(function($user) {
            return $user && $user->role === 'user';
        });
        
        if ($followers->isEmpty()) {
            return [];
        }
        
        // Batch fetch all counts to avoid N+1 queries
        $followerIds = $followers->pluck('id')->toArray();
        
        // Check which followers current user is following back - batch query
        $currentUserFollowing = Follow::where('follower_id', $userId)
            ->whereIn('following_id', $followerIds)
            ->pluck('following_id')
            ->toArray();
        
        // Count followers for each user - batch query
        $followersData = Follow::whereIn('following_id', $followerIds)->get();
        $followersMap = [];
        foreach ($followersData as $follow) {
            $followingId = $follow->following_id;
            if (!isset($followersMap[$followingId])) {
                $followersMap[$followingId] = 0;
            }
            $followersMap[$followingId]++;
        }
        
        // Count following for each user - batch query
        $followingData = Follow::whereIn('follower_id', $followerIds)->get();
        $followingMap = [];
        foreach ($followingData as $follow) {
            $followerId = $follow->follower_id;
            if (!isset($followingMap[$followerId])) {
                $followingMap[$followerId] = 0;
            }
            $followingMap[$followerId]++;
        }
        
        // Batch fetch posts count
        $postsData = Post::whereIn('author_id', $followerIds)->get();
        $postsMap = [];
        foreach ($postsData as $post) {
            $authorId = $post->author_id;
            if (!isset($postsMap[$authorId])) {
                $postsMap[$authorId] = 0;
            }
            $postsMap[$authorId]++;
        }
        
        return $followers->map(function ($follower) use ($followersMap, $followingMap, $postsMap, $currentUserFollowing) {
            return [
                '_id' => $follower->id,
                'id' => $follower->id,
                'first_name' => $follower->first_name,
                'last_name' => $follower->last_name,
                'name' => $follower->last_name . ' ' . $follower->first_name,
                'email' => $follower->email,
                'avatar_url' => $follower->avatar_url,
                'followers_count' => $followersMap[$follower->id] ?? 0,
                'following_count' => $followingMap[$follower->id] ?? 0,
                'posts_count' => $postsMap[$follower->id] ?? 0,
                'is_followed' => in_array($follower->id, $currentUserFollowing),
                'pets' => $follower->pets->map(function ($pet) {
                    return [
                        'id' => $pet->id,
                        'name' => $pet->name,
                        'avatar_url' => $pet->avatar_url
                    ];
                })->toArray()
            ];
        })->values()->toArray();
    }

    /**
     * Get following for a user
     *
     * @param string $userId
     * @param int $limit
     * @return array
     */
    public function getFollowing(string $userId, int $limit = 20): array
    {
        $follows = Follow::with('following.pets:id,owner_id,name,avatar_url')
            ->where('follower_id', $userId)
            ->limit($limit)
            ->get();
        
        $following = $follows->pluck('following')->filter(function($user) {
            return $user && $user->role === 'user';
        });
        
        if ($following->isEmpty()) {
            return [];
        }
        
        // Batch fetch all counts to avoid N+1 queries
        $followingIds = $following->pluck('id')->toArray();
        
        // Count followers for each user - batch query
        $followersData = Follow::whereIn('following_id', $followingIds)->get();
        $followersMap = [];
        foreach ($followersData as $follow) {
            $followingId = $follow->following_id;
            if (!isset($followersMap[$followingId])) {
                $followersMap[$followingId] = 0;
            }
            $followersMap[$followingId]++;
        }
        
        // Count following for each user - batch query
        $followingData = Follow::whereIn('follower_id', $followingIds)->get();
        $followingMap = [];
        foreach ($followingData as $follow) {
            $followerId = $follow->follower_id;
            if (!isset($followingMap[$followerId])) {
                $followingMap[$followerId] = 0;
            }
            $followingMap[$followerId]++;
        }
        
        // Batch fetch posts count
        $postsData = Post::whereIn('author_id', $followingIds)->get();
        $postsMap = [];
        foreach ($postsData as $post) {
            $authorId = $post->author_id;
            if (!isset($postsMap[$authorId])) {
                $postsMap[$authorId] = 0;
            }
            $postsMap[$authorId]++;
        }
        
        return $following->map(function ($followedUser) use ($followersMap, $followingMap, $postsMap) {
            return [
                '_id' => $followedUser->id,
                'id' => $followedUser->id,
                'first_name' => $followedUser->first_name,
                'last_name' => $followedUser->last_name,
                'name' => $followedUser->last_name . ' ' . $followedUser->first_name,
                'email' => $followedUser->email,
                'avatar_url' => $followedUser->avatar_url,
                'followers_count' => $followersMap[$followedUser->id] ?? 0,
                'following_count' => $followingMap[$followedUser->id] ?? 0,
                'posts_count' => $postsMap[$followedUser->id] ?? 0,
                'is_followed' => true, // Always true for following list
                'pets' => $followedUser->pets->map(function ($pet) {
                    return [
                        'id' => $pet->id,
                        'name' => $pet->name,
                        'avatar_url' => $pet->avatar_url
                    ];
                })->toArray()
            ];
        })->values()->toArray();
    }

    /**
     * Toggle follow status for a user (follow if not following, unfollow if already following)
     *
     * @param string $followerId
     * @param string $followingId
     * @return array ['followed' => bool, 'action' => string]
     * @throws \Exception if user tries to follow themselves
     */
    public function toggleFollow(string $followerId, string $followingId): array
    {
        // Prevent self-follow
        if ($followerId === $followingId) {
            throw new \Exception('Bạn không thể theo dõi chín mình');
        }
        
        // Check if already following
        $existingFollow = Follow::where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->first();
            
        if ($existingFollow) {
            // Unfollow
            $existingFollow->delete();
            return [
                'followed' => false,
                'action' => 'unfollowed'
            ];
        } else {
            // Follow
            Follow::create([
                'follower_id' => $followerId,
                'following_id' => $followingId
            ]);
            
            // Create notification
            $notificationService = app(\App\Services\NotificationService::class);
            $notification = $notificationService->createNotification(
                $followingId,
                \App\Models\Notification::TYPE_FOLLOW,
                $followerId
            );
            event(new \App\Events\NotificationCreated($notification));
            
            return [
                'followed' => true,
                'action' => 'followed'
            ];
        }
    }

    /**
     * Check if user is following another user
     *
     * @param string $followerId
     * @param string $followingId
     * @return bool
     */
    public function isFollowing(string $followerId, string $followingId): bool
    {
        return Follow::where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->exists();
    }

    /**
     * Get initial suggestions data (prominent users, people you may know, and counts)
     *
     * @param string $userId
     * @param int $prominentLimit
     * @param int $peopleYouMayKnowLimit
     * @return array
     */
    public function getInitialSuggestionsData(string $userId, int $prominentLimit = 3, int $peopleYouMayKnowLimit = 6): array
    {
        // Get counts in parallel
        $followersCount = Follow::where('following_id', $userId)->count();
        $followingCount = Follow::where('follower_id', $userId)->count();

        // Get prominent users
        $prominentUsers = $this->getProminentUsers($userId, $prominentLimit);

        // Get people you may know
        $peopleYouMayKnow = $this->getPeopleYouMayKnow($userId, $peopleYouMayKnowLimit);

        return [
            'prominent_users' => $prominentUsers,
            'people_you_may_know' => $peopleYouMayKnow,
            'followers_count' => $followersCount,
            'following_count' => $followingCount
        ];
    }

    /**
     * Get current user data with pets
     *
     * @param string $userId
     * @return array
     */
    public function getCurrentUserData(string $userId): array
    {
        $user = User::with('pets:id,owner_id,name,species,breed,avatar_url')->find($userId);
        
        if (!$user) {
            return [];
        }

        // Get counts
        $followersCount = Follow::where('following_id', $userId)->count();
        $followingCount = Follow::where('follower_id', $userId)->count();
        $postsCount = Post::where('author_id', $userId)->count();

        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'name' => $user->last_name . ' ' . $user->first_name,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url,
            'bio' => $user->bio,
            'posts_count' => $postsCount,
            'followers_count' => $followersCount,
            'following_count' => $followingCount,
            'pets' => $user->pets->map(function($pet) {
                return [
                    'id' => $pet->id,
                    'name' => $pet->name,
                    'species' => $pet->species,
                    'breed' => $pet->breed,
                    'avatar_url' => $pet->avatar_url
                ];
            })->toArray()
        ];
    }

    /**
     * Get user profile with pets and posts information
     *
     * @param string $userId
     * @param string|null $currentUserId
     * @param int $postsPage
     * @param int $postsPerPage
     * @return array
     */
    public function getUserProfileWithPetsAndPosts(string $userId, ?string $currentUserId = null, int $postsPage = 1, int $postsPerPage = 15): array
    {
        $user = User::with('pets:id,owner_id,name,species,breed,avatar_url')->find($userId);
        
        if (!$user) {
            return [];
        }

        // Get follow counts
        $followersCount = Follow::where('following_id', $userId)->count();
        $followingCount = Follow::where('follower_id', $userId)->count();

        // Check if current user is following this user
        $isFollowing = false;
        if ($currentUserId && $currentUserId !== $userId) {
            $isFollowing = Follow::where('follower_id', $currentUserId)
                ->where('following_id', $userId)
                ->exists();
        }

        // Get user's posts with pagination (exclude posts in groups)
        $postsQuery = Post::with(['author', 'likes', 'multimedia', 'group'])
            ->where('author_id', $userId)
            ->where('is_active', true)
            ->whereNull('group_id')
            ->orderBy('created_at', 'desc');
        
        $postsPaginated = $postsQuery->paginate($postsPerPage, ['*'], 'page', $postsPage);
        
        // Batch query to check liked posts (if current user is logged in)
        $userLikedPostIds = [];
        if ($currentUserId) {
            $postIds = collect($postsPaginated->items())->pluck('id')->toArray();
            $userLikedPostIds = \App\Models\PostLike::where('user_id', $currentUserId)
                ->whereIn('post_id', $postIds)
                ->pluck('post_id')
                ->toArray();
        }
        
        $postsData = [];
        foreach ($postsPaginated->items() as $post) {
            $postsData[] = [
                'id' => $post->id,
                'author_id' => $post->author_id,
                'content' => $post->content,
                'created_at' => $post->created_at,
                'updated_at' => $post->updated_at,
                'is_active' => $post->is_active,
                'author' => $post->author ? [
                    'id' => $post->author->id,
                    'first_name' => $post->author->first_name,
                    'last_name' => $post->author->last_name,
                    'avatar_url' => $post->author->avatar_url
                ] : null,
                'multimedia' => $post->multimedia ? $post->multimedia->map(function($m) {
                    return [
                        'id' => $m->id,
                        'type' => $m->type,
                        'file_url' => $m->file_url,
                        'media_url' => $m->file_url,
                        'media_type' => $m->type
                    ];
                })->toArray() : [],
                'likes_count' => $post->likes ? $post->likes->count() : 0,
                'comment_counts' => Comment::where('post_id', $post->id)->where('parent_id', null)->count(),
                'comments_count' => Comment::where('post_id', $post->id)->where('parent_id', null)->count(),
                'tagged_pets' => $post->getTaggedPetsAttribute(),
                'group_id' => $post->group_id,
                'group' => $post->group ? [
                    'id' => $post->group->id,
                    'name' => $post->group->name
                ] : null,
                'is_liked' => $currentUserId ? in_array($post->id, $userLikedPostIds) : false
            ];
        }

        return [
            'user' => $user,
            'followers_count' => $followersCount,
            'following_count' => $followingCount,
            'is_following' => $isFollowing,
            'posts' => $postsData,
            'posts_pagination' => [
                'current_page' => $postsPaginated->currentPage(),
                'last_page' => $postsPaginated->lastPage(),
                'per_page' => $postsPaginated->perPage(),
                'total' => $postsPaginated->total()
            ]
        ];
    }
}
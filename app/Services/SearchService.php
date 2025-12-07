<?php

namespace App\Services;

use App\Models\User;
use App\Models\Pet;
use App\Models\Follow;

class SearchService
{
    /**
     * Search users and pets by query
     * Excludes current user and their own pets
     *
     * @param string $query
     * @param string|null $currentUserId
     * @param int $limit
     * @return array
     */
    public function searchUsersAndPets(string $query, ?string $currentUserId = null, int $limit = 20): array
    {
        // Search users (role = 'user', exclude current user)
        $usersQuery = User::where('role', 'user')
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            });

        // Exclude current user using whereNotIn for MongoDB compatibility
        if ($currentUserId) {
            $usersQuery->whereNotIn('_id', [$currentUserId]);
        }

        $users = $usersQuery->limit($limit)->get();

        // Filter out current user after query (double check for safety)
        if ($currentUserId) {
            $users = $users->filter(function ($user) use ($currentUserId) {
                $userId = $user->_id ?? $user->id;
                return (string)$userId !== (string)$currentUserId;
            })->values();
        }

        // Search pets (exclude current user's pets)
        $petsQuery = Pet::with('owner:id,first_name,last_name,avatar_url')
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('species', 'like', "%{$query}%");
            });

        // Exclude current user's pets using whereNotIn for MongoDB compatibility
        if ($currentUserId) {
            $petsQuery->whereNotIn('owner_id', [$currentUserId]);
        }

        $pets = $petsQuery->limit($limit)->get();

        // Filter out current user's pets after query (double check for safety)
        if ($currentUserId) {
            $pets = $pets->filter(function ($pet) use ($currentUserId) {
                $ownerId = $pet->owner_id ?? $pet->owner_id ?? null;
                return $ownerId && (string)$ownerId !== (string)$currentUserId;
            })->values();
        }

        // Format users response
        $formattedUsers = $users->map(function ($user) {
            return [
                'id' => $user->_id ?? $user->id,
                'fullname' => $user->last_name . ' ' . $user->first_name,
                'avatar_url' => $user->avatar_url,
                'email' => $user->email,
            ];
        })->toArray();

        // Format pets response
        $formattedPets = $pets->map(function ($pet) {
            $owner = $pet->owner;
            return [
                'id' => $pet->_id ?? $pet->id,
                'name' => $pet->name,
                'avatar_url' => $pet->avatar_url,
                'breed' => $pet->breed ?? '',
                'owner_id' => $pet->owner_id,
                'owner_fullname' => $owner ? ($owner->last_name . ' ' . $owner->first_name) : '',
            ];
        })->toArray();

        return [
            'users' => $formattedUsers,
            'pets' => $formattedPets,
        ];
    }

    /**
     * Get search suggestions (5 users and 5 pets from following/followers)
     *
     * @param string $currentUserId
     * @return array
     */
    public function getSearchSuggestions(string $currentUserId): array
    {
        // Get users that current user is following
        $followingIds = Follow::where('follower_id', $currentUserId)
            ->pluck('following_id')
            ->toArray();

        // Get users that are following current user
        $followerIds = Follow::where('following_id', $currentUserId)
            ->pluck('follower_id')
            ->toArray();

        // Combine and get unique user IDs
        $relatedUserIds = array_unique(array_merge($followingIds, $followerIds));

        // Get 5 random users from following/followers (exclude current user)
        $suggestedUsers = [];
        if (!empty($relatedUserIds)) {
            // Filter out current user from related user IDs
            $relatedUserIds = array_filter($relatedUserIds, function ($id) use ($currentUserId) {
                return (string)$id !== (string)$currentUserId;
            });

            if (!empty($relatedUserIds)) {
                $users = User::whereIn('_id', $relatedUserIds)
                    ->where('role', 'user')
                    ->get();

                // Double check: filter out current user
                $users = $users->filter(function ($user) use ($currentUserId) {
                    $userId = $user->_id ?? $user->id;
                    return (string)$userId !== (string)$currentUserId;
                });

                // Shuffle and take 5 random users (MongoDB doesn't support inRandomOrder)
                $users = $users->shuffle()->take(5);

                $suggestedUsers = $users->map(function ($user) {
                    return [
                        'id' => $user->_id ?? $user->id,
                        'fullname' => $user->last_name . ' ' . $user->first_name,
                        'avatar_url' => $user->avatar_url,
                        'email' => $user->email,
                    ];
                })->toArray();
            }
        }

        // Get 5 random pets from following/followers (exclude current user's pets)
        $suggestedPets = [];
        if (!empty($relatedUserIds)) {
            // Filter out current user from related user IDs for pets
            $petOwnerIds = array_filter($relatedUserIds, function ($id) use ($currentUserId) {
                return (string)$id !== (string)$currentUserId;
            });

            if (!empty($petOwnerIds)) {
                $pets = Pet::with('owner:id,first_name,last_name,avatar_url')
                    ->whereIn('owner_id', $petOwnerIds)
                    ->get();

                // Double check: filter out current user's pets
                $pets = $pets->filter(function ($pet) use ($currentUserId) {
                    $ownerId = $pet->owner_id ?? null;
                    return $ownerId && (string)$ownerId !== (string)$currentUserId;
                });

                // Shuffle and take 5 random pets (MongoDB doesn't support inRandomOrder)
                $pets = $pets->shuffle()->take(5);

                $suggestedPets = $pets->map(function ($pet) {
                    $owner = $pet->owner;
                    return [
                        'id' => $pet->_id ?? $pet->id,
                        'name' => $pet->name,
                        'avatar_url' => $pet->avatar_url,
                        'breed' => $pet->breed ?? '',
                        'owner_id' => $pet->owner_id,
                        'owner_fullname' => $owner ? ($owner->last_name . ' ' . $owner->first_name) : '',
                    ];
                })->toArray();
            }
        }

        return [
            'users' => $suggestedUsers,
            'pets' => $suggestedPets,
        ];
    }
}


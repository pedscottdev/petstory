<?php

namespace App\Services;

use App\Models\Group;
use App\Models\GroupMember;
use App\Models\Post;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GroupService
{
    private const CACHE_TTL = 300; // 5 minutes

    /**
     * Get group by ID with creator information
     *
     * @param string $groupId
     * @return Group|null
     */
    public function getGroupWithCreator(string $groupId)
    {
        $group = Group::with('creator:id,first_name,last_name,avatar_url')
            ->find($groupId);

        if ($group) {
            // Use single aggregation query to get counts
            $counts = $this->getGroupCounts([$group->id]);
            $group->member_count = $counts[$group->id]['member_count'] ?? 0;
            $group->post_count = $counts[$group->id]['post_count'] ?? 0;

            // Get 3 latest members
            $latestMembers = $this->getLatestMembers([$group->id]);
            $group->latest_members = $latestMembers[$group->id] ?? [];
        }

        return $group;
    }

    /**
     * Get complete group details with members, posts, and membership status
     *
     * @param string $groupId
     * @param string|null $userId
     * @param int $page
     * @param int $perPage
     * @return array|null
     */
    public function getGroupDetails(string $groupId, ?string $userId = null, int $page = 1, int $perPage = 15)
    {
        $group = Group::with('creator:id,first_name,last_name,avatar_url')
            ->find($groupId);

        if (!$group) {
            return null;
        }

        // Get counts
        $counts = $this->getGroupCounts([$group->id]);
        $group->member_count = $counts[$group->id]['member_count'] ?? 0;
        $group->post_count = $counts[$group->id]['post_count'] ?? 0;

        // Get latest members
        $latestMembers = $this->getLatestMembers([$group->id]);
        $group->latest_members = $latestMembers[$group->id] ?? [];

        // Get all members with full details
        $members = $this->getMembers($groupId, 50);

        // Check membership status and get user role
        $isMember = false;
        $userRole = 'member';
        if ($userId) {
            $isMember = $this->isMember($groupId, $userId);
            if ($isMember) {
                $memberData = GroupMember::where('group_id', $groupId)
                    ->where('user_id', $userId)
                    ->first();
                if ($memberData) {
                    $userRole = $memberData->role ?? 'member';
                }
            }
        }

        // Get posts with pagination using PostService for proper data transformation
        $postService = app(PostService::class);
        $posts = $postService->getGroupPosts($groupId, $page, $perPage, $userId);

        return [
            'group' => $group,
            'members' => $members,
            'is_member' => $isMember,
            'user_role' => $userRole,
            'posts' => $posts
        ];
    }

    /**
     * Create a new group
     *
     * @param string $creatorId
     * @param array $data
     * @return Group
     */
    public function createGroup(string $creatorId, array $data): Group
    {
        $data['creator_id'] = $creatorId;

        // Set default avatar if not provided
        if (!isset($data['avatarUrl'])) {
            $data['avatarUrl'] = '/images/default-group-avatar.jpg';
        }

        $group = Group::create($data);

        // Add creator as member
        GroupMember::create([
            'group_id' => $group->id,
            'user_id' => $creatorId,
            'role' => 'admin'
        ]);

        return $group->load('creator:id,first_name,last_name,avatar_url');
    }

    /**
     * Update group information
     *
     * @param string $groupId
     * @param array $data
     * @return Group
     */
    public function updateGroup(string $groupId, array $data): Group
    {
        $group = Group::findOrFail($groupId);

        // Only update allowed fields
        $allowedFields = ['name', 'avatarUrl', 'description', 'category'];
        $updateData = array_intersect_key($data, array_flip($allowedFields));

        $group->update($updateData);

        // Clear cache for this group
        $this->clearGroupCache($groupId);

        return $group;
    }

    /**
     * Delete a group
     *
     * @param string $groupId
     * @return bool
     */
    public function deleteGroup(string $groupId): bool
    {
        $group = Group::findOrFail($groupId);

        // Use bulk delete operations
        GroupMember::where('group_id', $groupId)->delete();
        Post::where('group_id', $groupId)->delete();

        // Clear cache
        $this->clearGroupCache($groupId);

        return $group->delete();
    }

    /**
     * Get groups with pagination
     *
     * @param int $page
     * @param int $perPage
     * @param string|null $excludeCreatorId
     * @param string|null $userId
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getGroupsPaginated(int $page = 1, int $perPage = 15, ?string $excludeCreatorId = null, ?string $userId = null)
    {
        $query = Group::with('creator:id,first_name,last_name,avatar_url');

        if (!is_null($excludeCreatorId) && $excludeCreatorId !== '') {
            $query->where('creator_id', '!=', $excludeCreatorId);
        }

        $groups = $query->paginate($perPage, ['*'], 'page', $page);

        $groupIds = $groups->getCollection()->pluck('id')->toArray();
        $counts = $this->getGroupCounts($groupIds);

        // Get latest members for all groups
        $latestMembers = $this->getLatestMembers($groupIds);

        // Get membership status for all groups if user is logged in
        $membershipStatus = [];
        if ($userId) {
            $membershipStatus = $this->getMembershipStatusBatch($groupIds, $userId);
        }

        $groups->getCollection()->transform(function ($group) use ($counts, $latestMembers, $membershipStatus, $userId) {
            $group->member_count = $counts[$group->id]['member_count'] ?? 0;
            $group->post_count = $counts[$group->id]['post_count'] ?? 0;
            $group->latest_members = $latestMembers[$group->id] ?? [];
            $group->is_member = $membershipStatus[$group->id] ?? false;
            $group->is_owner = $userId ? $group->creator_id === $userId : false;
            return $group;
        });

        return $groups;
    }

    /**
     * Search groups by name
     *
     * @param string $query
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function searchGroups(string $query, int $limit = 20)
    {
        // Use regex for better MongoDB performance
        $groups = Group::with('creator:id,first_name,last_name,avatar_url')
            ->where('name', 'regex', '/' . preg_quote($query, '/') . '/i')
            ->limit($limit)
            ->get();

        // Get counts in batch
        $groupIds = $groups->pluck('id')->toArray();
        $counts = $this->getGroupCounts($groupIds);

        // Get latest members for all groups
        $latestMembers = $this->getLatestMembers($groupIds);

        // Attach counts and latest members
        $groups->transform(function ($group) use ($counts, $latestMembers) {
            $group->member_count = $counts[$group->id]['member_count'] ?? 0;
            $group->post_count = $counts[$group->id]['post_count'] ?? 0;
            $group->latest_members = $latestMembers[$group->id] ?? [];
            return $group;
        });

        return $groups;
    }

    /**
     * Add member to group
     *
     * @param string $groupId
     * @param string $userId
     * @param string $role
     * @return GroupMember
     */
    public function addMember(string $groupId, string $userId, string $role = 'member'): GroupMember
    {
        // Check if group exists
        $group = Group::find($groupId);
        if (!$group) {
            throw ValidationException::withMessages([
                'group' => ['Group not found.'],
            ]);
        }

        // Check if already member with single query
        $existingMember = GroupMember::where('group_id', $groupId)
            ->where('user_id', $userId)
            ->first();

        if ($existingMember) {
            throw ValidationException::withMessages([
                'user' => ['User is already a member of this group.'],
            ]);
        }

        // Clear cache when adding member - clear specific user cache
        $cacheKey = "group:{$groupId}:member:{$userId}";
        Cache::forget($cacheKey);

        return GroupMember::create([
            'group_id' => $groupId,
            'user_id' => $userId,
            'role' => $role
        ]);
    }

    /**
     * Remove member from group
     *
     * @param string $groupId
     * @param string $userId
     * @return bool
     */
    public function removeMember(string $groupId, string $userId): bool
    {
        $result = GroupMember::where('group_id', $groupId)
            ->where('user_id', $userId)
            ->delete();

        if ($result) {
            // Clear specific user cache
            $cacheKey = "group:{$groupId}:member:{$userId}";
            Cache::forget($cacheKey);
        }

        return $result > 0;
    }

    /**
     * Check if user is member of group (with caching)
     *
     * @param string $groupId
     * @param string $userId
     * @return bool
     */
    public function isMember(string $groupId, string $userId): bool
    {
        $cacheKey = "group:{$groupId}:member:{$userId}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($groupId, $userId) {
            return GroupMember::where('group_id', $groupId)
                ->where('user_id', $userId)
                ->exists();
        });
    }

    /**
     * Get group members
     *
     * @param string $groupId
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getMembers(string $groupId, int $limit = 50)
    {
        return GroupMember::with('user:id,first_name,last_name,avatar_url,email')
            ->where('group_id', $groupId)
            ->limit($limit)
            ->get()
            ->map(function ($member) {
                return [
                    'id'         => $member->user->id,
                    'first_name' => $member->user->first_name,
                    'last_name'  => $member->user->last_name,
                    'fullname'   => $member->user->last_name . ' ' . $member->user->first_name,
                    'avatar_url' => $member->user->avatar_url,
                    'email'      => $member->user->email,
                    'role'       => $member->role ?? 'member'
                ];
            });
    }

    /**
     * Get user's groups
     *
     * @param string $userId
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserGroups(string $userId, int $limit = 20)
    {
        $groupMembers = GroupMember::with('group:id,name,avatarUrl,creator_id')
            ->where('user_id', $userId)
            ->limit($limit)
            ->get();

        // Get all group IDs
        $groupIds = $groupMembers->pluck('group.id')->filter()->toArray();

        // Get counts in batch
        $counts = $this->getGroupCounts($groupIds);

        // Get latest members for all groups
        $latestMembers = $this->getLatestMembers($groupIds);

        return $groupMembers->map(function ($member) use ($counts, $latestMembers) {
            $group = $member->group;
            if ($group) {
                $group->member_count = $counts[$group->id]['member_count'] ?? 0;
                $group->post_count = $counts[$group->id]['post_count'] ?? 0;
                $group->latest_members = $latestMembers[$group->id] ?? [];
            }
            return $group;
        })->filter();
    }

    /**
     * Get groups created by the user
     *
     * @param string $userId
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getMyCreatedGroups(string $userId, int $limit = 20)
    {
        $groups = Group::with('creator:id,first_name,last_name,avatar_url')
            ->where('creator_id', $userId)
            ->limit($limit)
            ->get();

        // Get counts in batch
        $groupIds = $groups->pluck('id')->toArray();
        $counts = $this->getGroupCounts($groupIds);

        // Get latest members for all groups
        $latestMembers = $this->getLatestMembers($groupIds);

        // Attach counts and latest members
        $groups->transform(function ($group) use ($counts, $latestMembers) {
            $group->member_count = $counts[$group->id]['member_count'] ?? 0;
            $group->post_count = $counts[$group->id]['post_count'] ?? 0;
            $group->latest_members = $latestMembers[$group->id] ?? [];
            return $group;
        });

        return $groups;
    }

    /**
     * Change member role
     *
     * @param string $groupId
     * @param string $userId
     * @param string $role
     * @return bool
     */
    public function changeMemberRole(string $groupId, string $userId, string $role): bool
    {
        $result = GroupMember::where('group_id', $groupId)
            ->where('user_id', $userId)
            ->update(['role' => $role]);

        if ($result) {
            // No need to clear cache for role changes, it doesn't affect is_member
        }

        return $result > 0;
    }

    /**
     * Get group posts with full details
     *
     * @param string $groupId
     * @param int $page
     * @param int $perPage
     * @param string|null $userId
     * @return array
     */
    public function getGroupPosts(string $groupId, int $page = 1, int $perPage = 15, string $userId = null)
    {
        $postService = app(PostService::class);
        return $postService->getGroupPosts($groupId, $page, $perPage, $userId);
    }

    /**
     * Get counts for multiple groups in a single batch query
     *
     * @param array $groupIds
     * @return array
     */
    private function getGroupCounts(array $groupIds): array
    {
        if (empty($groupIds)) {
            return [];
        }

        // Use MongoDB aggregation pipeline for efficient counting
        $memberCounts = GroupMember::raw(function ($collection) use ($groupIds) {
            return $collection->aggregate([
                ['$match' => ['group_id' => ['$in' => $groupIds]]],
                ['$group' => [
                    '_id' => '$group_id',
                    'count' => ['$sum' => 1]
                ]]
            ]);
        });

        $postCounts = Post::raw(function ($collection) use ($groupIds) {
            return $collection->aggregate([
                ['$match' => ['group_id' => ['$in' => $groupIds]]],
                ['$group' => [
                    '_id' => '$group_id',
                    'count' => ['$sum' => 1]
                ]]
            ]);
        });

        // Format results
        $counts = [];
        foreach ($groupIds as $groupId) {
            $counts[$groupId] = [
                'member_count' => 0,
                'post_count' => 0
            ];
        }

        foreach ($memberCounts as $row) {
            $counts[$row->_id]['member_count'] = $row->count;
        }

        foreach ($postCounts as $row) {
            $counts[$row->_id]['post_count'] = $row->count;
        }

        return $counts;
    }

    /**
     * Get latest 3 members for multiple groups
     *
     * @param array $groupIds
     * @return array
     */
    private function getLatestMembers(array $groupIds): array
    {
        if (empty($groupIds)) {
            return [];
        }

        // Get latest 3 members for each group
        $members = GroupMember::with('user:_id,first_name,last_name,avatar_url')
            ->whereIn('group_id', $groupIds)
            ->orderBy('created_at', 'desc')
            ->get();

        // Group members by group_id and take first 3
        $latestMembers = [];
        foreach ($groupIds as $groupId) {
            $latestMembers[$groupId] = [];
        }

        foreach ($members as $member) {
            if (count($latestMembers[$member->group_id]) < 3 && $member->user) {
                $latestMembers[$member->group_id][] = [
                    'fullname' => $member->user->first_name . ' ' . $member->user->last_name,
                    'avatar_url' => $member->user->avatar_url
                ];
            }
        }

        return $latestMembers;
    }

    /**
     * Get membership status for multiple groups for a user
     *
     * @param array $groupIds
     * @param string $userId
     * @return array
     */
    private function getMembershipStatusBatch(array $groupIds, string $userId): array
    {
        if (empty($groupIds)) {
            return [];
        }

        // Initialize all groups as not member
        $membershipStatus = array_fill_keys($groupIds, false);

        // Get membership records
        $memberships = GroupMember::where('user_id', $userId)
            ->whereIn('group_id', $groupIds)
            ->pluck('group_id');

        // Mark groups where user is a member
        foreach ($memberships as $groupId) {
            $membershipStatus[$groupId] = true;
        }

        return $membershipStatus;
    }

    /**
     * Clear cache for a group
     *
     * @param string $groupId
     * @param string|null $userId (optional) If provided, only clears cache for that user
     * @return void
     */
    private function clearGroupCache(string $groupId, ?string $userId = null): void
    {
        if ($userId) {
            // Clear specific user cache
            $cacheKey = "group:{$groupId}:member:{$userId}";
            Cache::forget($cacheKey);
        }
        // Note: Laravel doesn't support wildcard forget, so we only clear specific keys
    }
}

<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\User;
use App\Traits\TracksUserOnlineStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * ConversationController
 *
 * Handles API endpoints for managing conversations (create, read, update, delete, manage members).
 */
class ConversationController extends Controller
{
    /**
     * Get all conversations for the authenticated user.
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get conversations with latest message and member count
        $conversations = $user->conversations()
            ->with([
                'messages' => function ($query) {
                    $query->orderBy('created_at', 'desc')->limit(1);
                },
                'users',
            ])
            ->orderBy('updated_at', 'desc')
            ->paginate(20);

        // Add unread message count and online status for each conversation
        $conversationsWithUnread = $conversations->map(function ($conversation) use ($user) {
            $unreadCount = $conversation->messages()
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->count();

            // Add online status to users
            $users = $conversation->users->map(function ($u) {
                return array_merge($u->toArray(), [
                    'is_online' => TracksUserOnlineStatus::isUserOnline($u->id)
                ]);
            })->toArray();

            $conversationArray = $conversation->toArray();
            $conversationArray['users'] = $users;

            return array_merge($conversationArray, [
                'unread_count' => $unreadCount,
            ]);
        });

        return response()->json(
            [
                'success' => true,
                'data' => $conversationsWithUnread,
                'pagination' => [
                    'current_page' => $conversations->currentPage(),
                    'per_page' => $conversations->perPage(),
                    'total' => $conversations->total(),
                    'last_page' => $conversations->lastPage(),
                ],
            ],
            Response::HTTP_OK
        );
    }

    /**
     * Create a new conversation.
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'is_group' => 'required|boolean',
            'description' => 'nullable|string|max:1000',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        $user = $request->user();

        // Ensure creator is included
        $userIds = array_unique(array_merge($validated['user_ids'], [$user->id]));

        // For 1-on-1 conversations, check if one already exists
        if (!$validated['is_group'] && count($userIds) === 2) {
            $existingConversation = Conversation::where('is_group', false)
                ->whereHas('users', function ($query) use ($userIds) {
                    $query->whereIn('user_id', $userIds);
                }, '=', 2)
                ->first();

            if ($existingConversation) {
                $existingConversation = $existingConversation->load('users');
                $convArray = $existingConversation->toArray();
                // Normalize id for MongoDB (_id) or SQL (id)
                $convArray['id'] = (string) ($existingConversation->_id ?? $existingConversation->id);

                return response()->json(
                    [
                        'success' => true,
                        'data' => $convArray,
                        'message' => 'Conversation already exists.',
                    ],
                    Response::HTTP_OK
                );
            }
        }

        // Create conversation
        $conversation = Conversation::create([
            'name' => $validated['name'] ?? null,
            'is_group' => $validated['is_group'],
            'creator_id' => $user->id,
            'description' => $validated['description'] ?? null,
            'user_ids' => $userIds,  // Store user IDs directly for MongoDB
        ]);

        // Attach users (members) to conversation for SQL compatibility
        $conversation->users()->attach($userIds);

        // Load users relationship and normalize id for client
        $conversation = $conversation->load('users');
        $convArray = $conversation->toArray();
        $convArray['id'] = (string) ($conversation->_id ?? $conversation->id);

        return response()->json(
            [
                'success' => true,
                'data' => $convArray,
                'message' => 'Conversation created successfully.',
            ],
            Response::HTTP_CREATED
        );
    }

    /**
     * Get a specific conversation.
     *
     * @param int $conversationId
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $conversationId, Request $request): JsonResponse
    {
        $user = $request->user();
        // Handle MongoDB ID format inconsistencies
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            // Try finding by _id or id fields explicitly
            $conversation = Conversation::where('_id', $conversationId)->orWhere('id', $conversationId)->first();
        }

        if (!$conversation) {
            return response()->json(
                ['message' => 'Conversation not found.'],
                Response::HTTP_NOT_FOUND
            );
        }

        // Verify user is a member
        $isMember = $conversation->hasMember($user->id);

        if (!$isMember) {
            return response()->json(
                ['message' => 'User is not a member of this conversation.'],
                Response::HTTP_FORBIDDEN
            );
        }

        // Load users and add online status
        $conversation = $conversation->load('users', 'creator');
        $conversationArray = $conversation->toArray();
        
        // Add online status to users
        if (isset($conversationArray['users'])) {
            $conversationArray['users'] = collect($conversationArray['users'])->map(function ($u) {
                return array_merge($u, [
                    'is_online' => TracksUserOnlineStatus::isUserOnline($u['id'] ?? $u['_id'] ?? null)
                ]);
            })->toArray();
        }

        return response()->json(
            [
                'success' => true,
                'data' => $conversationArray,
            ],
            Response::HTTP_OK
        );
    }

    /**
     * Update a conversation.
     *
     * @param int $conversationId
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(string $conversationId, Request $request): JsonResponse
    {
        $user = $request->user();
        // Handle MongoDB ID format inconsistencies
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            // Try finding by _id or id fields explicitly
            $conversation = Conversation::where('_id', $conversationId)->orWhere('id', $conversationId)->first();
        }

        if (!$conversation) {
            return response()->json(
                ['message' => 'Conversation not found.'],
                Response::HTTP_NOT_FOUND
            );
        }

        // Only creator can update
        if ($conversation->creator_id !== $user->id) {
            return response()->json(
                ['message' => 'Only the creator can update this conversation.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $conversation->update($validated);

        return response()->json(
            [
                'success' => true,
                'data' => $conversation,
                'message' => 'Conversation updated successfully.',
            ],
            Response::HTTP_OK
        );
    }

    /**
     * Delete a conversation.
     *
     * @param int $conversationId
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $conversationId, Request $request): JsonResponse
    {
        $user = $request->user();
        // Handle MongoDB ID format inconsistencies
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            // Try finding by _id or id fields explicitly
            $conversation = Conversation::where('_id', $conversationId)->orWhere('id', $conversationId)->first();
        }

        if (!$conversation) {
            return response()->json(
                ['message' => 'Conversation not found.'],
                Response::HTTP_NOT_FOUND
            );
        }

        // Only creator can delete
        if ($conversation->creator_id !== $user->id) {
            return response()->json(
                ['message' => 'Only the creator can delete this conversation.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $conversation->delete();

        return response()->json(
            ['success' => true, 'message' => 'Conversation deleted successfully.'],
            Response::HTTP_OK
        );
    }

    /**
     * Add a user to the conversation.
     *
     * @param int $conversationId
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addMember(string $conversationId, Request $request): JsonResponse
    {
        $user = $request->user();
        // Handle MongoDB ID format inconsistencies
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            // Try finding by _id or id fields explicitly
            $conversation = Conversation::where('_id', $conversationId)->orWhere('id', $conversationId)->first();
        }

        if (!$conversation) {
            return response()->json(
                ['message' => 'Conversation not found.'],
                Response::HTTP_NOT_FOUND
            );
        }

        // Only creator can add members
        if ($conversation->creator_id !== $user->id) {
            return response()->json(
                ['message' => 'Only the creator can add members.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $userId = $validated['user_id'];

        // Check if user is already a member
        if ($conversation->users()->where('user_id', $userId)->exists()) {
            return response()->json(
                ['message' => 'User is already a member of this conversation.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Add user to conversation
        $conversation->users()->attach($userId);

        return response()->json(
            [
                'success' => true,
                'data' => $conversation->load('users'),
                'message' => 'Member added successfully.',
            ],
            Response::HTTP_OK
        );
    }

    /**
     * Remove a user from the conversation.
     *
     * @param int $conversationId
     * @param int $userId
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeMember(string $conversationId, int $userId, Request $request): JsonResponse
    {
        $user = $request->user();
        // Handle MongoDB ID format inconsistencies
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            // Try finding by _id or id fields explicitly
            $conversation = Conversation::where('_id', $conversationId)->orWhere('id', $conversationId)->first();
        }

        if (!$conversation) {
            return response()->json(
                ['message' => 'Conversation not found.'],
                Response::HTTP_NOT_FOUND
            );
        }

        // Only creator can remove members (or user removing themselves)
        if ($conversation->creator_id !== $user->id && $user->id !== $userId) {
            return response()->json(
                ['message' => 'You do not have permission to remove members.'],
                Response::HTTP_FORBIDDEN
            );
        }

        // Remove user from conversation
        $conversation->users()->detach($userId);

        return response()->json(
            [
                'success' => true,
                'data' => $conversation->load('users'),
                'message' => 'Member removed successfully.',
            ],
            Response::HTTP_OK
        );
    }

    /**
     * Get all members of a conversation.
     *
     * @param int $conversationId
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMembers(string $conversationId, Request $request): JsonResponse
    {
        $user = $request->user();
        // Handle MongoDB ID format inconsistencies
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            // Try finding by _id or id fields explicitly
            $conversation = Conversation::where('_id', $conversationId)->orWhere('id', $conversationId)->first();
        }

        if (!$conversation) {
            return response()->json(
                ['message' => 'Conversation not found.'],
                Response::HTTP_NOT_FOUND
            );
        }

        // Verify user is a member
        $isMember = $conversation->hasMember($user->id);

        if (!$isMember) {
            return response()->json(
                ['message' => 'User is not a member of this conversation.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $members = $conversation->users()->paginate(20);

        return response()->json(
            [
                'success' => true,
                'data' => $members->items(),
                'pagination' => [
                    'current_page' => $members->currentPage(),
                    'per_page' => $members->perPage(),
                    'total' => $members->total(),
                    'last_page' => $members->lastPage(),
                ],
            ],
            Response::HTTP_OK
        );
    }

    /**
     * Get suggested users for creating a new conversation.
     * Returns 7 random users from followers and following list.
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSuggestedUsers(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            // Get followers and following IDs
            $followersIds = $user->followers()->pluck('follower_id')->toArray();
            $followingIds = $user->following()->pluck('following_id')->toArray();

            // Combine and remove duplicates and current user
            $suggestedUserIds = array_unique(array_merge($followersIds, $followingIds));
            $suggestedUserIds = array_diff($suggestedUserIds, [$user->id]);

            // Get random 7 users from the combined list, or fewer if not enough
            $randomIds = array_slice(array_values($suggestedUserIds), 0, min(7, count($suggestedUserIds)));

            // If we don't have enough users, get more from the entire system
            if (count($randomIds) < 7) {
                $additionalIds = User::where('id', '!=', $user->id)
                    ->whereNotIn('id', $randomIds)
                    ->limit(7 - count($randomIds))
                    ->pluck('id')
                    ->toArray();

                $randomIds = array_merge($randomIds, $additionalIds);
            }

            // Shuffle the IDs
            shuffle($randomIds);

            // Get users
            $suggestedUsers = User::whereIn('id', $randomIds)->get();

            return response()->json(
                [
                    'success' => true,
                    'data' => $suggestedUsers,
                ],
                Response::HTTP_OK
            );
        } catch (\Exception $e) {
            return response()->json(
                [
                    'success' => false,
                    'message' => $e->getMessage(),
                ],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    /**
     * Get or create a 1-on-1 conversation with a user.
     * Ensures that only one conversation exists between two users.
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrCreateConversation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = $request->user();
        $otherUserId = $validated['user_id'];

        // Prevent user from creating conversation with themselves
        if ($user->id == $otherUserId) {
            return response()->json(
                ['message' => 'Cannot create conversation with yourself.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Check if conversation already exists between these two users
        $existingConversation = Conversation::where('is_group', false)
            ->whereHas('users', function ($query) use ($user, $otherUserId) {
                $query->whereIn('user_id', [$user->id, $otherUserId]);
            }, '=', 2)
            ->first();

        if ($existingConversation) {
            $existingConversation = $existingConversation->load('users');
            $convArray = $existingConversation->toArray();
            // Normalize id for MongoDB (_id) or SQL (id)
            $convArray['id'] = (string) ($existingConversation->_id ?? $existingConversation->id);

            return response()->json(
                [
                    'success' => true,
                    'data' => $convArray,
                    'message' => 'Conversation already exists.',
                ],
                Response::HTTP_OK
            );
        }

        // Create new conversation
        $userIds = [$user->id, $otherUserId];
        $conversation = Conversation::create([
            'is_group' => false,
            'creator_id' => $user->id,
            'user_ids' => $userIds,  // Store user IDs directly for MongoDB
        ]);

        // Attach users (members) to conversation for SQL compatibility
        $conversation->users()->attach($userIds);

        // Load users relationship and normalize id for client
        $conversation = $conversation->load('users');
        $convArray = $conversation->toArray();
        $convArray['id'] = (string) ($conversation->_id ?? $conversation->id);

        return response()->json(
            [
                'success' => true,
                'data' => $convArray,
                'message' => 'Conversation created successfully.',
            ],
            Response::HTTP_CREATED
        );
    }

    /**
     * Mark all messages in a conversation as read for the current user.
     *
     * @param string $conversationId
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead(string $conversationId, Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Handle MongoDB ID format inconsistencies
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            $conversation = Conversation::where('_id', $conversationId)->orWhere('id', $conversationId)->first();
        }

        if (!$conversation) {
            return response()->json(
                ['message' => 'Conversation not found.'],
                Response::HTTP_NOT_FOUND
            );
        }

        // Verify user is a member
        $isMember = $conversation->hasMember($user->id);

        if (!$isMember) {
            return response()->json(
                ['message' => 'User is not a member of this conversation.'],
                Response::HTTP_FORBIDDEN
            );
        }

        // Mark all messages from other users as read
        $updatedCount = \App\Models\Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(
            [
                'success' => true,
                'data' => [
                    'updated_count' => $updatedCount,
                ],
                'message' => 'Messages marked as read.',
            ],
            Response::HTTP_OK
        );
    }
}

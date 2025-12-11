<?php

namespace App\Services;

use App\Models\Post;
use App\Models\PostPet;
use App\Models\PostMultimedia;
use App\Models\PostLike;
use App\Models\Comment;
use App\Models\Follow;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PostService
{
    protected $imageUploadService;

    /**
     * Constructor
     *
     * @param ImageUploadService $imageUploadService
     */
    public function __construct(ImageUploadService $imageUploadService)
    {
        $this->imageUploadService = $imageUploadService;
    }

    /**
     * Get post by ID with full details (author, likes, multimedia, etc.)
     *
     * @param string $postId
     * @return Post|null
     */
    public function getPostWithDetails(string $postId): ?Post
    {
        return Post::with(['author', 'likes', 'multimedia', 'group'])
            ->find($postId);
    }

    /**
     * Create a new post
     *
     * @param string $userId
     * @param array $data
     * @return Post
     * @throws ValidationException
     */
    public function createPost(string $userId, array $data): Post
    {
        // Create the post
        $post = Post::create([
            'author_id' => $userId,
            'content' => $data['content'],
            'group_id' => $data['group_id'] ?? null,
            'is_active' => true
        ]);

        // Tag pets if provided
        if (!empty($data['tagged_pets'])) {
            foreach ($data['tagged_pets'] as $petId) {
                PostPet::create([
                    'post_id' => $post->id,
                    'pet_id' => $petId
                ]);
            }
        }

        // Add multimedia if provided
        if (!empty($data['media'])) {
            foreach ($data['media'] as $media) {
                PostMultimedia::create([
                    'post_id' => $post->id,
                    'media_url' => $media['url'],
                    'media_type' => $media['type']
                ]);
            }
        }

        // Reload with relationships
        return $post->fresh(['author', 'multimedia', 'group']);
    }

    /**
     * Update an existing post
     *
     * @param string $postId
     * @param array $data
     * @return Post|null
     */
    public function updatePost(string $postId, array $data): ?Post
    {
        $post = Post::find($postId);
        
        if (!$post) {
            return null;
        }

        // Update basic fields
        if (isset($data['content'])) {
            $post->content = $data['content'];
        }
        if (isset($data['is_active'])) {
            $post->is_active = $data['is_active'];
        }
        $post->save();

        // Update tagged pets if provided
        if (isset($data['tagged_pets'])) {
            // Remove old tags
            PostPet::where('post_id', $postId)->delete();
            
            // Add new tags
            foreach ($data['tagged_pets'] as $petId) {
                PostPet::create([
                    'post_id' => $postId,
                    'pet_id' => $petId
                ]);
            }
        }

        return $post->fresh(['author', 'multimedia', 'group']);
    }

    /**
     * Delete a post
     *
     * @param string $postId
     * @return bool
     */
    public function deletePost(string $postId): bool
    {
        $post = Post::find($postId);
        
        if (!$post) {
            return false;
        }

        // Get all multimedia files before deleting records
        $multimediaFiles = PostMultimedia::where('post_id', $postId)->get();
        
        // Delete physical files from storage
        foreach ($multimediaFiles as $media) {
            if ($media->file_url) {
                try {
                    $this->imageUploadService->deleteImage($media->file_url);
                } catch (\Exception $e) {
                    // Log error but continue with deletion
                    \Log::warning("Failed to delete image file: {$media->file_url}", [
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        // Delete related data
        PostPet::where('post_id', $postId)->delete();
        PostMultimedia::where('post_id', $postId)->delete();
        PostLike::where('post_id', $postId)->delete();
        Comment::where('post_id', $postId)->delete();

        return $post->delete();
    }

    /**
     * Get filtered user feed
     *
     * @param string $userId
     * @param string $filterType ('latest', 'following', 'popular')
     * @param int $page
     * @param int $perPage
     * @return array
     */
    public function getFilteredUserFeed(string $userId, string $filterType, int $page = 1, int $perPage = 15): array
    {
        $query = Post::with(['author', 'likes', 'multimedia', 'group'])
            ->where('is_active', true);

        switch ($filterType) {
            case 'following':
                // Get posts from users the current user is following
                $followingIds = Follow::where('follower_id', $userId)
                    ->pluck('following_id')
                    ->toArray();
                $followingIds[] = $userId; // Include own posts
                $query->whereIn('author_id', $followingIds);
                break;

            case 'popular':
                // Get popular posts (most likes in last 7 days)
                $query->where('created_at', '>=', now()->subDays(7))
                    ->withCount('likes')
                    ->orderBy('likes_count', 'desc');
                break;

            case 'latest':
            default:
                // All posts, latest first
                break;
        }

        // Default ordering by created_at desc if not popular
        if ($filterType !== 'popular') {
            $query->orderBy('created_at', 'desc');
        }

        $posts = $query->paginate($perPage, ['*'], 'page', $page);

        // Batch query to check liked posts
        $postIds = collect($posts->items())->pluck('id')->toArray();
        $userLikedPostIds = PostLike::where('user_id', $userId)
            ->whereIn('post_id', $postIds)
            ->pluck('post_id')
            ->toArray();

        // Batch query to get comment counts for all posts
        $commentCounts = [];
        if (!empty($postIds)) {
            $comments = Comment::whereIn('post_id', $postIds)
                ->where('parent_id', null) // Only count top-level comments, not replies
                ->get(['post_id']);
            
            // Count comments by post_id in PHP (MongoDB doesn't support selectRaw well)
            foreach ($comments as $comment) {
                if (!isset($commentCounts[$comment->post_id])) {
                    $commentCounts[$comment->post_id] = 0;
                }
                $commentCounts[$comment->post_id]++;
            }
        }

        // Add is_liked and comment_counts to each post
        $postsData = [];
        foreach ($posts->items() as $post) {
            $postArray = $post->toArray();
            $postArray['is_liked'] = in_array($post->id, $userLikedPostIds);
            $postArray['comment_counts'] = $commentCounts[$post->id] ?? 0;
            $postArray['likes_count'] = count($post->likes ?? []);
            $postsData[] = $postArray;
        }

        return [
            'data' => $postsData,
            'current_page' => $posts->currentPage(),
            'last_page' => $posts->lastPage(),
            'per_page' => $posts->perPage(),
            'total' => $posts->total()
        ];
    }

    /**
     * Get user feed (following posts only)
     *
     * @param string $userId
     * @param int $page
     * @param int $perPage
     * @return array
     */
    public function getUserFeed(string $userId, int $page = 1, int $perPage = 15): array
    {
        return $this->getFilteredUserFeed($userId, 'following', $page, $perPage);
    }

    /**
     * Get posts from a specific group
     *
     * @param string $groupId
     * @param int $page
     * @param int $perPage
     * @return array
     */
    public function getGroupPosts(string $groupId, int $page = 1, int $perPage = 15, string $userId = null): array
    {
        $posts = Post::with(['author', 'likes', 'multimedia', 'group'])
            ->where('group_id', $groupId)
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Batch query to get comment counts for all posts
        $postIds = collect($posts->items())->pluck('id')->toArray();
        
        // Batch query to check liked posts (if user is logged in)
        $userLikedPostIds = [];
        if ($userId) {
            $userLikedPostIds = PostLike::where('user_id', $userId)
                ->whereIn('post_id', $postIds)
                ->pluck('post_id')
                ->toArray();
        }
        
        $commentCounts = [];
        if (!empty($postIds)) {
            $comments = Comment::whereIn('post_id', $postIds)
                ->where('parent_id', null)
                ->get(['post_id']);
            
            // Count comments by post_id in PHP (MongoDB doesn't support selectRaw well)
            foreach ($comments as $comment) {
                if (!isset($commentCounts[$comment->post_id])) {
                    $commentCounts[$comment->post_id] = 0;
                }
                $commentCounts[$comment->post_id]++;
            }
        }

        // Add comment_counts and is_liked to each post
        $postsData = [];
        foreach ($posts->items() as $post) {
            $postArray = $post->toArray();
            $postArray['comment_counts'] = $commentCounts[$post->id] ?? 0;
            $postArray['likes_count'] = count($post->likes ?? []);
            $postArray['is_liked'] = $userId ? in_array($post->id, $userLikedPostIds) : false;
            $postsData[] = $postArray;
        }

        return [
            'data' => $postsData,
            'current_page' => $posts->currentPage(),
            'last_page' => $posts->lastPage(),
            'per_page' => $posts->perPage(),
            'total' => $posts->total()
        ];
    }

    /**
     * Get posts from a specific user
     *
     * @param string $userId
     * @param int $page
     * @param int $perPage
     * @return array
     */
    public function getUserPosts(string $userId, int $page = 1, int $perPage = 15, string $currentUserId = null, string $petId = null): array
    {
        $query = Post::with(['author', 'likes', 'multimedia', 'group'])
            ->where('author_id', $userId)
            ->where('is_active', true);

        // Filter by pet if petId is provided
        if ($petId) {
            $postIdsWithPet = PostPet::where('pet_id', $petId)
                ->pluck('post_id')
                ->toArray();
            
            $query->whereIn('_id', $postIdsWithPet);
        }

        $posts = $query->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Batch query to get comment counts for all posts
        $postIds = collect($posts->items())->pluck('id')->toArray();
        
        // Batch query to check liked posts (if current user is logged in)
        $userLikedPostIds = [];
        if ($currentUserId) {
            $userLikedPostIds = PostLike::where('user_id', $currentUserId)
                ->whereIn('post_id', $postIds)
                ->pluck('post_id')
                ->toArray();
        }
        
        $commentCounts = [];
        if (!empty($postIds)) {
            $comments = Comment::whereIn('post_id', $postIds)
                ->where('parent_id', null)
                ->get(['post_id']);
            
            // Count comments by post_id in PHP (MongoDB doesn't support selectRaw well)
            foreach ($comments as $comment) {
                if (!isset($commentCounts[$comment->post_id])) {
                    $commentCounts[$comment->post_id] = 0;
                }
                $commentCounts[$comment->post_id]++;
            }
        }

        // Add comment_counts and is_liked to each post
        $postsData = [];
        foreach ($posts->items() as $post) {
            $postArray = $post->toArray();
            $postArray['comment_counts'] = $commentCounts[$post->id] ?? 0;
            $postArray['likes_count'] = count($post->likes ?? []);
            $postArray['is_liked'] = $currentUserId ? in_array($post->id, $userLikedPostIds) : false;
            $postsData[] = $postArray;
        }

        return [
            'data' => $postsData,
            'current_page' => $posts->currentPage(),
            'last_page' => $posts->lastPage(),
            'per_page' => $posts->perPage(),
            'total' => $posts->total()
        ];
    }

    /**
     * Toggle like status for a post
     *
     * @param string $userId
     * @param string $postId
     * @return array
     * @throws ValidationException
     */
    public function togglePostLike(string $userId, string $postId): array
    {
        $post = Post::find($postId);
        
        if (!$post) {
            throw ValidationException::withMessages([
                'post_id' => ['Bài viết không tồn tại']
            ]);
        }

        $existingLike = PostLike::where('user_id', $userId)
            ->where('post_id', $postId)
            ->first();

        if ($existingLike) {
            // Unlike
            $existingLike->delete();
            return [
                'action' => 'unliked',
                'like_count' => PostLike::where('post_id', $postId)->count()
            ];
        } else {
            // Like
            PostLike::create([
                'user_id' => $userId,
                'post_id' => $postId
            ]);
            
            // Create notification if user is not the post author
            if ($post->author_id !== $userId) {
                $notificationService = app(\App\Services\NotificationService::class);
                $notification = $notificationService->createNotification(
                    $post->author_id,
                    \App\Models\Notification::TYPE_LIKE_POST,
                    $userId,
                    ['post_id' => $postId, 'post_content' => $post->content]
                );
                event(new \App\Events\NotificationCreated($notification));
            }
            
            return [
                'action' => 'liked',
                'like_count' => PostLike::where('post_id', $postId)->count()
            ];
        }
    }

    /**
     * Get like count for a post
     *
     * @param string $postId
     * @return int
     */
    public function getPostLikeCount(string $postId): int
    {
        return PostLike::where('post_id', $postId)->count();
    }

    /**
     * Check if user has liked a post
     *
     * @param string $userId
     * @param string $postId
     * @return bool
     */
    public function hasLikedPost(string $userId, string $postId): bool
    {
        return PostLike::where('user_id', $userId)
            ->where('post_id', $postId)
            ->exists();
    }

    /**
     * Add a comment to a post
     *
     * @param string $userId
     * @param string $postId
     * @param string $content
     * @return Comment
     * @throws ValidationException
     */
    public function addComment(string $userId, string $postId, string $content): array
    {
        $post = Post::find($postId);
        
        if (!$post) {
            throw ValidationException::withMessages([
                'post_id' => ['Bài viết không tồn tại']
            ]);
        }

        $comment = Comment::create([
            'author_id' => $userId,
            'post_id' => $postId,
            'content' => $content
        ]);

        // Create notification if user is not the post author (only for top-level comments, not replies)
        // Note: addComment is only called for top-level comments, addReply is for replies
        if ($post->author_id !== $userId) {
            $notificationService = app(\App\Services\NotificationService::class);
            $notification = $notificationService->createNotification(
                $post->author_id,
                \App\Models\Notification::TYPE_COMMENT,
                $userId,
                ['post_id' => $postId, 'post_content' => $post->content]
            );
            event(new \App\Events\NotificationCreated($notification));
        }

        // Load user relationship before returning
        $comment->load('user');

        return [
            'id' => $comment->id,
            '_id' => $comment->id,
            'post_id' => $comment->post_id,
            'author_id' => $comment->author_id,
            'content' => $comment->content,
            'created_at' => $comment->created_at,
            'updated_at' => $comment->updated_at,
            'author' => $comment->user ? [
                'id' => $comment->user->id,
                '_id' => $comment->user->id,
                'first_name' => $comment->user->first_name,
                'last_name' => $comment->user->last_name,
                'full_name' => $comment->user->last_name . ' ' . $comment->user->first_name,
                'name' => $comment->user->last_name . ' ' . $comment->user->first_name,
                'avatar_url' => $comment->user->avatar_url
            ] : null,
            'user' => $comment->user ? [
                'id' => $comment->user->id,
                '_id' => $comment->user->id,
                'first_name' => $comment->user->first_name,
                'last_name' => $comment->user->last_name,
                'full_name' => $comment->user->last_name . ' ' . $comment->user->first_name,
                'name' => $comment->user->last_name . ' ' . $comment->user->first_name,
                'avatar_url' => $comment->user->avatar_url
            ] : null
        ];
    }

    /**
     * Get comments for a post
     *
     * @param string $postId
     * @param int $limit
     * @return array
     */
    public function getPostComments(string $postId, int $limit = 50): array
    {
        $comments = Comment::with('user')
            ->where('post_id', $postId)
            ->where('parent_id', null) // Only get top-level comments
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return $comments->map(function ($comment) {
            return [
                'id' => $comment->id,
                '_id' => $comment->id,
                'post_id' => $comment->post_id,
                'author_id' => $comment->author_id,
                'content' => $comment->content,
                'created_at' => $comment->created_at,
                'updated_at' => $comment->updated_at,
                'author' => $comment->user ? [
                    'id' => $comment->user->id,
                    '_id' => $comment->user->id,
                    'first_name' => $comment->user->first_name,
                    'last_name' => $comment->user->last_name,
                    'full_name' => $comment->user->last_name . ' ' . $comment->user->first_name,
                    'name' => $comment->user->last_name . ' ' . $comment->user->first_name,
                    'avatar_url' => $comment->user->avatar_url
                ] : null,
                'user' => $comment->user ? [
                    'id' => $comment->user->id,
                    '_id' => $comment->user->id,
                    'first_name' => $comment->user->first_name,
                    'last_name' => $comment->user->last_name,
                    'full_name' => $comment->user->last_name . ' ' . $comment->user->first_name,
                    'name' => $comment->user->last_name . ' ' . $comment->user->first_name,
                    'avatar_url' => $comment->user->avatar_url
                ] : null
            ];
        })->toArray();
    }

    /**
     * Delete a comment
     *
     * @param string $commentId
     * @param string $userId
     * @return bool
     */
    public function deleteComment(string $commentId, string $userId): bool
    {
        $comment = Comment::find($commentId);
        
        if (!$comment || $comment->author_id !== $userId) {
            return false;
        }

        return $comment->delete();
    }

    /**
     * Report a post
     *
     * @param string $userId
     * @param string $postId
     * @param string $reason
     * @return \App\Models\Report
     * @throws ValidationException
     */
    public function reportPost(string $userId, string $postId, string $reason): \App\Models\Report
    {
        $post = Post::find($postId);
        
        if (!$post) {
            throw ValidationException::withMessages([
                'post_id' => ['Bài viết không tồn tại']
            ]);
        }

        // Get the reason text from the reason code
        $reasonText = \App\Models\Report::getReasonText($reason, 'post');

        return \App\Models\Report::create([
            'reporter_id' => $userId,
            'post_id' => $postId,
            'reason' => $reason,
            'reason_text' => $reasonText
        ]);
    }

    /**
     * Add a reply to a comment
     *
     * @param string $userId
     * @param string $postId
     * @param string $commentId
     * @param string $content
     * @return Comment
     * @throws ValidationException
     */
    public function addReply(string $userId, string $postId, string $commentId, string $content): array
    {
        $post = Post::find($postId);
        
        if (!$post) {
            throw ValidationException::withMessages([
                'post_id' => ['Bài viết không tồn tại']
            ]);
        }

        $parentComment = Comment::find($commentId);
        
        if (!$parentComment || $parentComment->post_id !== $postId) {
            throw ValidationException::withMessages([
                'comment_id' => ['Bình luận không tồn tại']
            ]);
        }

        $reply = Comment::create([
            'author_id' => $userId,
            'post_id' => $postId,
            'parent_id' => $commentId,
            'content' => $content
        ]);

        // Load user relationship before returning
        $reply->load('user');

        return [
            'id' => $reply->id,
            '_id' => $reply->id,
            'post_id' => $reply->post_id,
            'author_id' => $reply->author_id,
            'parent_id' => $reply->parent_id,
            'content' => $reply->content,
            'created_at' => $reply->created_at,
            'updated_at' => $reply->updated_at,
            'author' => $reply->user ? [
                'id' => $reply->user->id,
                '_id' => $reply->user->id,
                'first_name' => $reply->user->first_name,
                'last_name' => $reply->user->last_name,
                'full_name' => $reply->user->last_name . ' ' . $reply->user->first_name,
                'name' => $reply->user->last_name . ' ' . $reply->user->first_name,
                'avatar_url' => $reply->user->avatar_url
            ] : null,
            'user' => $reply->user ? [
                'id' => $reply->user->id,
                '_id' => $reply->user->id,
                'first_name' => $reply->user->first_name,
                'last_name' => $reply->user->last_name,
                'full_name' => $reply->user->last_name . ' ' . $reply->user->first_name,
                'name' => $reply->user->last_name . ' ' . $reply->user->first_name,
                'avatar_url' => $reply->user->avatar_url
            ] : null
        ];
    }
}

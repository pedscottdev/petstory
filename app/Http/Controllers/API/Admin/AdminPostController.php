<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\Comment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPostController extends Controller
{
    /**
     * Get list of posts with search, filter, and pagination for admin management.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['author', 'multimedia']);

        // Search by author name
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            
            // Find user IDs matching the search term
            $userIds = User::where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            })->pluck('_id')->toArray();
            
            $query->whereIn('author_id', $userIds);
        }

        // Filter by status (is_active)
        if ($request->has('status') && $request->status !== 'all') {
            $isActive = $request->status === 'displayed';
            $query->where('is_active', $isActive);
        }

        // Order by created_at descending (newest first)
        $query->orderBy('created_at', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 10);
        $posts = $query->paginate($perPage);

        // Get post IDs for batch queries
        $postIds = collect($posts->items())->pluck('_id')->toArray();

        // Batch query for likes count
        $likesCounts = [];
        if (!empty($postIds)) {
            $likes = PostLike::whereIn('post_id', $postIds)->get(['post_id']);
            foreach ($likes as $like) {
                $postId = (string) $like->post_id;
                $likesCounts[$postId] = ($likesCounts[$postId] ?? 0) + 1;
            }
        }

        // Batch query for comments count
        $commentsCounts = [];
        if (!empty($postIds)) {
            $comments = Comment::whereIn('post_id', $postIds)
                ->whereNull('parent_id')
                ->get(['post_id']);
            foreach ($comments as $comment) {
                $postId = (string) $comment->post_id;
                $commentsCounts[$postId] = ($commentsCounts[$postId] ?? 0) + 1;
            }
        }

        // Transform posts data
        $transformedPosts = collect($posts->items())->map(function ($post) use ($likesCounts, $commentsCounts) {
            $postId = (string) $post->_id;
            $author = $post->author;
            
            return [
                'id' => $postId,
                'content' => $post->content,
                'is_active' => $post->is_active ?? true,
                'created_at' => $post->created_at ? $post->created_at->format('Y-m-d H:i:s') : null,
                'date' => $post->created_at ? $post->created_at->format('Y-m-d') : null,
                'author' => $author ? [
                    'id' => (string) $author->_id,
                    'name' => $author->first_name . ' ' . $author->last_name,
                    'email' => $author->email,
                    'avatar' => $author->avatar_url,
                ] : null,
                'multimedia' => collect($post->multimedia)->map(function ($media) {
                    return [
                        'id' => (string) $media->_id,
                        'type' => $media->type,
                        'file_url' => $media->file_url,
                    ];
                })->toArray(),
                'likes_count' => $likesCounts[$postId] ?? 0,
                'comments_count' => $commentsCounts[$postId] ?? 0,
                'tagged_pets' => $post->tagged_pets ?? [],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'posts' => $transformedPosts,
                'pagination' => [
                    'current_page' => $posts->currentPage(),
                    'last_page' => $posts->lastPage(),
                    'per_page' => $posts->perPage(),
                    'total' => $posts->total(),
                ],
            ],
        ]);
    }

    /**
     * Toggle post block status (block/unblock).
     *
     * @param string $postId
     * @return JsonResponse
     */
    public function toggleBlock(string $postId): JsonResponse
    {
        $post = Post::find($postId);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Bài viết không tồn tại.',
            ], 404);
        }

        // Toggle is_active status
        $post->is_active = !($post->is_active ?? true);
        $post->save();

        $statusMessage = $post->is_active 
            ? 'Bài viết đã được bỏ chặn thành công.'
            : 'Bài viết đã bị chặn thành công.';

        return response()->json([
            'success' => true,
            'message' => $statusMessage,
            'data' => [
                'post' => [
                    'id' => (string) $post->_id,
                    'is_active' => $post->is_active,
                ],
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers\API;

use App\Services\PostService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PostController extends Controller
{
    protected PostService $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    /**
     * Get post by ID with details
     *
     * @param string $postId
     * @return JsonResponse
     */
    public function show(string $postId): JsonResponse
    {
        try {
            $post = $this->postService->getPostWithDetails($postId);
            
            if (!$post) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bài viết không tồn tại'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $post
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy bài viết',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new post
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'content' => 'required|string|max:5000',
                'group_id' => 'nullable|string',
                'tagged_pets' => 'required_without:group_id|array|min:1',
                'tagged_pets.*' => 'string',
                'media' => 'nullable|array',
                'media.*.url' => 'required|string',
                'media.*.type' => 'required|in:image,video'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $post = $this->postService->createPost(
                $request->user()->id,
                $request->only(['content', 'group_id', 'tagged_pets', 'media'])
            );

            return response()->json([
                'success' => true,
                'message' => 'Tạo bài viết thành công',
                'data' => $post
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo bài viết',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update post
     *
     * @param Request $request
     * @param string $postId
     * @return JsonResponse
     */
    public function update(Request $request, string $postId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'content' => 'nullable|string|max:5000',
                'is_active' => 'nullable|boolean',
                'tagged_pets' => 'nullable|array',
                'tagged_pets.*' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $post = $this->postService->updatePost($postId, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật bài viết thành công',
                'data' => $post
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật bài viết',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a post
     *
     * @param string $postId
     * @return JsonResponse
     */
    public function destroy(string $postId): JsonResponse
    {
        try {
            $this->postService->deletePost($postId);

            return response()->json([
                'success' => true,
                'message' => 'Xóa bài viết thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa bài viết',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get filtered user feed
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getFilteredFeed(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'filter_type' => 'required|in:latest,following,popular',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $posts = $this->postService->getFilteredUserFeed(
                $request->user()->id,
                $request->filter_type,
                $request->get('page', 1),
                $request->get('per_page', 15)
            );

            return response()->json([
                'success' => true,
                'data' => $posts
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy bảng tin',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user feed (following posts only)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUserFeed(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);

            $posts = $this->postService->getUserFeed($request->user()->id, $page, $perPage);

            return response()->json([
                'success' => true,
                'data' => $posts
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy bảng tin',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get group posts
     *
     * @param Request $request
     * @param string $groupId
     * @return JsonResponse
     */
    public function getGroupPosts(Request $request, string $groupId): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            $userId = $request->user() ? $request->user()->id : null;

            $posts = $this->postService->getGroupPosts($groupId, $page, $perPage, $userId);

            return response()->json([
                'success' => true,
                'data' => $posts
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy bài viết của nhóm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user posts
     *
     * @param Request $request
     * @param string $userId
     * @return JsonResponse
     */
    public function getUserPosts(Request $request, string $userId): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            $petId = $request->get('pet_id', null);
            $currentUserId = $request->user() ? $request->user()->id : null;

            $posts = $this->postService->getUserPosts($userId, $page, $perPage, $currentUserId, $petId);

            return response()->json([
                'success' => true,
                'data' => $posts
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy bài viết của người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle like status for a post
     *
     * @param Request $request
     * @param string $postId
     * @return JsonResponse
     */
    public function toggleLike(Request $request, string $postId): JsonResponse
    {
        try {
            $result = $this->postService->togglePostLike($request->user()->id, $postId);

            return response()->json([
                'success' => true,
                'message' => $result['action'] === 'liked' ? 'Đã thích bài viết' : 'Đã hủy thích bài viết',
                'data' => $result
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bài viết không tồn tại',
                'errors' => $e->errors()
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật trạng thái thích',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get like count for a post
     *
     * @param string $postId
     * @return JsonResponse
     */
    public function getLikeCount(string $postId): JsonResponse
    {
        try {
            $count = $this->postService->getPostLikeCount($postId);

            return response()->json([
                'success' => true,
                'data' => ['like_count' => $count]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy lượt thích',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if user has liked a post
     *
     * @param Request $request
     * @param string $postId
     * @return JsonResponse
     */
    public function hasLiked(Request $request, string $postId): JsonResponse
    {
        try {
            $isLiked = $this->postService->hasLikedPost($request->user()->id, $postId);

            return response()->json([
                'success' => true,
                'data' => ['is_liked' => $isLiked]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi kiểm tra trạng thái thích',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add comment to post
     *
     * @param Request $request
     * @param string $postId
     * @return JsonResponse
     */
    public function addComment(Request $request, string $postId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'content' => 'required|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $comment = $this->postService->addComment($request->user()->id, $postId, $request->get('content'));

            return response()->json([
                'success' => true,
                'message' => 'Thêm bình luận thành công',
                'data' => $comment
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bài viết không tồn tại',
                'errors' => $e->errors()
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi thêm bình luận',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get comments for a post
     *
     * @param Request $request
     * @param string $postId
     * @return JsonResponse
     */
    public function getComments(Request $request, string $postId): JsonResponse
    {
        try {
            $limit = $request->get('limit', 50);
            $comments = $this->postService->getPostComments($postId, $limit);

            return response()->json([
                'success' => true,
                'data' => $comments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy bình luận',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a comment
     *
     * @param string $commentId
     * @return JsonResponse
     */
    public function deleteComment(Request $request, string $commentId): JsonResponse
    {
        try {
            $success = $this->postService->deleteComment($commentId, $request->user()->id);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa bình luận'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Xóa bình luận thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa bình luận',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Report a post
     *
     * @param Request $request
     * @param string $postId
     * @return JsonResponse
     */
    public function reportPost(Request $request, string $postId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'reason' => 'required|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $report = $this->postService->reportPost(
                $request->user()->id,
                $postId,
                $request->get('reason')
            );

            return response()->json([
                'success' => true,
                'message' => 'Báo cáo bài viết thành công',
                'data' => $report
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bài viết không tồn tại',
                'errors' => $e->errors()
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi báo cáo bài viết',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add reply to a comment
     *
     * @param Request $request
     * @param string $postId
     * @param string $commentId
     * @return JsonResponse
     */
    public function addReply(Request $request, string $postId, string $commentId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'content' => 'required|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $reply = $this->postService->addReply(
                $request->user()->id,
                $postId,
                $commentId,
                $request->get('content')
            );

            return response()->json([
                'success' => true,
                'message' => 'Thêm phản hồi thành công',
                'data' => $reply
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bài viết hoặc bình luận không tồn tại',
                'errors' => $e->errors()
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi thêm phản hồi',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

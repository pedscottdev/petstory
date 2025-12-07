<?php

namespace App\Http\Controllers\API;

use App\Services\UserService;
use App\Traits\TracksUserOnlineStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Get user profile with pets and follow information
     *
     * @param Request $request
     * @param string $userId
     * @return JsonResponse
     */
    public function getProfile(Request $request, string $userId): JsonResponse
    {
        try {
            $currentUserId = $request->user() ? $request->user()->id : null;
            $postsPage = $request->get('posts_page', 1);
            $postsPerPage = $request->get('posts_per_page', 15);
            
            $profile = $this->userService->getUserProfileWithPetsAndPosts($userId, $currentUserId, $postsPage, $postsPerPage);
            
            if (empty($profile)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng không tồn tại'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $profile
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy hồ sơ người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user with pets information
     *
     * @param string $userId
     * @return JsonResponse
     */
    public function getUserWithPets(string $userId): JsonResponse
    {
        try {
            $user = $this->userService->getUserWithPets($userId);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng không tồn tại'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thông tin người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all users with pagination and optional search
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search', '');

            $users = $this->userService->getAllUsers($page, $perPage, $search);

            return response()->json([
                'success' => true,
                'data' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user profile
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'bio' => 'nullable|string|max:1000',
                'avatar_url' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $this->userService->updateUserProfile($request->user()->id, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật hồ sơ thành công',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật hồ sơ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change user password
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function changePassword(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'password' => 'required|string|min:8|confirmed'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $this->userService->changePassword(
                $request->user()->id,
                $request->current_password,
                $request->password
            );

            return response()->json([
                'success' => true,
                'message' => 'Đổi mật khẩu thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi đổi mật khẩu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get prominent users
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getProminentUsers(Request $request): JsonResponse
    {
        try {
            $limit = $request->get('limit', 3);
            $users = $this->userService->getProminentUsers($request->user()->id, $limit);

            return response()->json([
                'success' => true,
                'data' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách người dùng nổi bật',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get people you may know
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getPeopleYouMayKnow(Request $request): JsonResponse
    {
        try {
            $limit = $request->get('limit', 10);
            $users = $this->userService->getPeopleYouMayKnow($request->user()->id, $limit);

            return response()->json([
                'success' => true,
                'data' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách gợi ý',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user suggestions
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUserSuggestions(Request $request): JsonResponse
    {
        try {
            $limit = $request->get('limit', 10);
            $users = $this->userService->getUserSuggestions($request->user()->id, $limit);

            return response()->json([
                'success' => true,
                'data' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách gợi ý',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get followers for a user
     *
     * @param Request $request
     * @param string $userId
     * @return JsonResponse
     */
    public function getFollowers(Request $request, string $userId): JsonResponse
    {
        try {
            $limit = $request->get('limit', 20);
            $followers = $this->userService->getFollowers($userId, $limit);

            return response()->json([
                'success' => true,
                'data' => $followers
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách người theo dõi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get following for a user
     *
     * @param Request $request
     * @param string $userId
     * @return JsonResponse
     */
    public function getFollowing(Request $request, string $userId): JsonResponse
    {
        try {
            $limit = $request->get('limit', 20);
            $following = $this->userService->getFollowing($userId, $limit);

            return response()->json([
                'success' => true,
                'data' => $following
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách đang theo dõi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle follow status
     *
     * @param Request $request
     * @param string $followingId
     * @return JsonResponse
     */
    public function toggleFollow(Request $request, string $followingId): JsonResponse
    {
        try {
            $result = $this->userService->toggleFollow($request->user()->id, $followingId);

            return response()->json([
                'success' => true,
                'message' => $result['action'] === 'followed' ? 'Đã theo dõi' : 'Đã hủy theo dõi',
                'data' => $result
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật trạng thái theo dõi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if user is following another user
     *
     * @param Request $request
     * @param string $followingId
     * @return JsonResponse
     */
    public function isFollowing(Request $request, string $followingId): JsonResponse
    {
        try {
            $isFollowing = $this->userService->isFollowing($request->user()->id, $followingId);

            return response()->json([
                'success' => true,
                'data' => ['is_following' => $isFollowing]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi kiểm tra trạng thái theo dõi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get initial suggestions data (prominent users, people you may know, and counts)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getInitialSuggestionsData(Request $request): JsonResponse
    {
        try {
            $prominentLimit = $request->get('prominent_limit', 3);
            $peopleLimit = $request->get('people_limit', 6);
            
            $data = $this->userService->getInitialSuggestionsData(
                $request->user()->id,
                $prominentLimit,
                $peopleLimit
            );

            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy dữ liệu gợi ý',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get newfeed data (user profile, pets, people you may know, and posts)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getNewfeedData(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()->id;
            $peopleLimit = $request->get('people_limit', 5);
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            
            // Get current user data with pets
            $userData = $this->userService->getCurrentUserData($userId);
            
            // Get people you may know
            $peopleYouMayKnow = $this->userService->getPeopleYouMayKnow($userId, $peopleLimit);
            
            // Get posts (latest from all users)
            $postService = app(\App\Services\PostService::class);
            $posts = $postService->getFilteredUserFeed($userId, 'latest', $page, $perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $userData,
                    'people_you_may_know' => $peopleYouMayKnow,
                    'posts' => $posts
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy dữ liệu trang chủ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark user as online
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function markOnline(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Mark user as online in cache
            TracksUserOnlineStatus::markUserOnline($user->id);
            
            return response()->json([
                'success' => true,
                'message' => 'User marked as online'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error marking user as online',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark user as offline
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function markOffline(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Mark user as offline in cache
            TracksUserOnlineStatus::markUserOffline($user->id);
            
            return response()->json([
                'success' => true,
                'message' => 'User marked as offline'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error marking user as offline',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\API;

use App\Services\GroupService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class GroupController extends Controller
{
    protected GroupService $groupService;

    public function __construct(GroupService $groupService)
    {
        $this->groupService = $groupService;
    }

    /**
     * Get group by ID with creator information
     *
     * @param Request $request
     * @param string $groupId
     * @return JsonResponse
     */
    public function show(Request $request, string $groupId): JsonResponse
    {
        try {
            $userId = $request->user() ? $request->user()->id : null;
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            
            $data = $this->groupService->getGroupDetails($groupId, $userId, $page, $perPage);
            
            if (!$data) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nhóm không tồn tại'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thông tin nhóm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new group
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'category' => 'nullable|string',
                'avatar' => 'nullable|image|mimes:jpg,png,jpeg,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $groupData = $request->only(['name', 'description', 'category']);
            
            // Handle avatar upload if provided
            if ($request->hasFile('avatar')) {
                $uploadService = app(\App\Services\ImageUploadService::class);
                $result = $uploadService->uploadImage(
                    $request->file('avatar'),
                    'uploads/groups/temp',
                    'avatar'
                );
                $groupData['avatarUrl'] = $result['path'];
            }

            $group = $this->groupService->createGroup(
                $request->user()->id,
                $groupData
            );
            
            // Update the avatar path with actual group ID if avatar was uploaded
            if ($request->hasFile('avatar')) {
                $uploadService = app(\App\Services\ImageUploadService::class);
                $result = $uploadService->uploadImage(
                    $request->file('avatar'),
                    "uploads/groups/{$group->id}",
                    'avatar'
                );
                $group->update(['avatarUrl' => $result['path']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tạo nhóm thành công',
                'data' => $group
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo nhóm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update group information
     *
     * @param Request $request
     * @param string $groupId
     * @return JsonResponse
     */
    public function update(Request $request, string $groupId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'nullable|string|max:255',
                'description' => 'nullable|string|max:1000',
                'category' => 'nullable|string',
                'avatar' => 'nullable|image|mimes:jpg,png,jpeg,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $groupData = $request->only(['name', 'description', 'category']);
            
            // Handle avatar upload if provided
            if ($request->hasFile('avatar')) {
                $uploadService = app(\App\Services\ImageUploadService::class);
                $result = $uploadService->uploadImage(
                    $request->file('avatar'),
                    "uploads/groups/{$groupId}",
                    'avatar'
                );
                $groupData['avatarUrl'] = $result['path'];
            }

            $group = $this->groupService->updateGroup($groupId, $groupData);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật nhóm thành công',
                'data' => $group
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật nhóm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a group
     *
     * @param string $groupId
     * @return JsonResponse
     */
    public function destroy(string $groupId): JsonResponse
    {
        try {
            $this->groupService->deleteGroup($groupId);

            return response()->json([
                'success' => true,
                'message' => 'Xóa nhóm thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa nhóm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get groups with pagination
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            $userId = $request->user() ? $request->user()->id : null;

            $groups = $this->groupService->getGroupsPaginated($page, $perPage, null, $userId);

            return response()->json([
                'success' => true,
                'data' => $groups
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách nhóm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search groups by name
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'query' => 'required|string|min:1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu tìm kiếm không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $groups = $this->groupService->searchGroups($request->get('query'));

            return response()->json([
                'success' => true,
                'data' => $groups
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tìm kiếm nhóm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add member to group
     *
     * @param Request $request
     * @param string $groupId
     * @return JsonResponse
     */
    public function addMember(Request $request, string $groupId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|string',
                'role' => 'nullable|in:member,moderator,admin'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $member = $this->groupService->addMember(
                $groupId,
                $request->user_id,
                $request->get('role', 'member')
            );

            return response()->json([
                'success' => true,
                'message' => 'Thêm thành viên vào nhóm thành công',
                'data' => $member
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể thêm thành viên',
                'errors' => $e->errors()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi thêm thành viên',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove member from group
     *
     * @param string $groupId
     * @param string $userId
     * @return JsonResponse
     */
    public function removeMember(string $groupId, string $userId): JsonResponse
    {
        try {
            $success = $this->groupService->removeMember($groupId, $userId);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa thành viên'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Xóa thành viên khỏi nhóm thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa thành viên',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if user is member of group
     *
     * @param string $groupId
     * @param string $userId
     * @return JsonResponse
     */
    public function isMember(string $groupId, string $userId): JsonResponse
    {
        try {
            $isMember = $this->groupService->isMember($groupId, $userId);

            return response()->json([
                'success' => true,
                'data' => ['is_member' => $isMember]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi kiểm tra tư cách thành viên',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get group members
     *
     * @param Request $request
     * @param string $groupId
     * @return JsonResponse
     */
    public function getMembers(Request $request, string $groupId): JsonResponse
    {
        try {
            $limit = $request->get('limit', 50);
            $members = $this->groupService->getMembers($groupId, $limit);

            return response()->json([
                'success' => true,
                'data' => $members
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách thành viên',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's groups
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUserGroups(Request $request): JsonResponse
    {
        try {
            $limit = $request->get('limit', 20);
            $groups = $this->groupService->getUserGroups($request->user()->id, $limit);

            return response()->json([
                'success' => true,
                'data' => $groups
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách nhóm của bạn',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get groups created by the user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getMyCreatedGroups(Request $request): JsonResponse
    {
        try {
            $limit = $request->get('limit', 6);
            $groups = $this->groupService->getMyCreatedGroups($request->user()->id, $limit);

            return response()->json([
                'success' => true,
                'data' => $groups
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách nhóm bạn tạo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change member role
     *
     * @param Request $request
     * @param string $groupId
     * @param string $userId
     * @return JsonResponse
     */
    public function changeMemberRole(Request $request, string $groupId, string $userId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'role' => 'required|in:member,moderator,admin'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $success = $this->groupService->changeMemberRole($groupId, $userId, $request->role);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể thay đổi vai trò thành viên'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Thay đổi vai trò thành viên thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi thay đổi vai trò thành viên',
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
    public function getPosts(Request $request, string $groupId): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            $userId = $request->user() ? $request->user()->id : null;

            $posts = $this->groupService->getGroupPosts($groupId, $page, $perPage, $userId);

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
}

<?php

namespace App\Http\Controllers\API;

use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class ImageUploadController extends Controller
{
    protected ImageUploadService $uploadService;

    public function __construct(ImageUploadService $uploadService)
    {
        $this->uploadService = $uploadService;
    }

    /**
     * Upload user avatar
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadUserAvatar(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'avatar' => 'required|image|mimes:jpg,png,jpeg,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu tải lên không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $userId = $request->user()->id;
            $oldAvatarPath = $request->user()->avatar_url;

            $result = $this->uploadService->uploadUserAvatar(
                $request->file('avatar'),
                $userId,
                $oldAvatarPath
            );

            // Update user avatar in database
            $request->user()->update(['avatar_url' => $result['path']]);

            return response()->json([
                'success' => true,
                'message' => 'Tải lên ảnh đại diện thành công',
                'data' => [
                    'path' => $result['path']
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải lên ảnh đại diện',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload pet avatar
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadPetAvatar(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'pet_id' => 'required|string',
                'avatar' => 'required|image|mimes:jpg,png,jpeg,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu tải lên không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $petId = $request->input('pet_id');
            
            // Verify pet ownership
            $pet = \App\Models\Pet::find($petId);
            $userId = (string) $request->user()->id;
            $petOwnerId = (string) ($pet->owner_id ?? null);
            
            if (!$pet || $petOwnerId !== $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền tải lên ảnh cho thú cưng này'
                ], 403);
            }

            $oldAvatarPath = $pet->avatar_url;

            $result = $this->uploadService->uploadPetAvatar(
                $request->file('avatar'),
                $petId,
                $oldAvatarPath
            );

            // Update pet avatar in database
            $pet->update(['avatar_url' => $result['path']]);

            return response()->json([
                'success' => true,
                'message' => 'Tải lên ảnh đại diện thú cưng thành công',
                'data' => [
                    'path' => $result['path']
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải lên ảnh đại diện thú cưng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload group avatar
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadGroupAvatar(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'group_id' => 'required|string',
                'avatar' => 'required|image|mimes:jpg,png,jpeg,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu tải lên không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $groupId = $request->input('group_id');
            
            // Verify group ownership or admin role
            $group = \App\Models\Group::find($groupId);
            $userId = (string) $request->user()->id;
            $groupCreatorId = (string) ($group->creator_id ?? null);
            
            if (!$group || $groupCreatorId !== $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền tải lên ảnh cho nhóm này'
                ], 403);
            }

            $oldAvatarPath = $group->avatarUrl ?? null;

            $result = $this->uploadService->uploadGroupAvatar(
                $request->file('avatar'),
                $groupId,
                $oldAvatarPath
            );

            // Update group avatar in database
            $group->update(['avatarUrl' => $result['path']]);

            return response()->json([
                'success' => true,
                'message' => 'Tải lên ảnh đại diện nhóm thành công',
                'data' => [
                    'path' => $result['path']
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải lên ảnh đại diện nhóm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload group cover image
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadGroupCover(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'group_id' => 'required|string',
                'cover' => 'required|image|mimes:jpg,png,jpeg,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu tải lên không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $groupId = $request->input('group_id');
            
            // Verify group ownership or admin role
            $group = \App\Models\Group::find($groupId);
            $userId = (string) $request->user()->id;
            $groupCreatorId = (string) ($group->creator_id ?? null);
            
            if (!$group || $groupCreatorId !== $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền tải lên ảnh đại diện cho nhóm này'
                ], 403);
            }

            $oldAvatarPath = $group->avatarUrl ?? null;

            $result = $this->uploadService->uploadGroupCover(
                $request->file('cover'),
                $groupId,
                $oldAvatarPath
            );

            // Update group avatar in database
            $group->update(['avatarUrl' => $result['path']]);

            return response()->json([
                'success' => true,
                'message' => 'Tải lên ảnh đại diện nhóm thành công',
                'data' => [
                    'path' => $result['path']
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải lên ảnh đại diện nhóm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload post images
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadPostImages(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'post_id' => 'required|string',
                'images' => 'required|array|min:1|max:5',
                'images.*' => 'image|mimes:jpg,png,jpeg,webp|max:8000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu tải lên không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $postId = $request->input('post_id');
            
            // Verify post ownership
            $post = \App\Models\Post::find($postId);
            $userId = (string) $request->user()->id;
            $postAuthorId = (string) ($post->author_id ?? null);
            
            if (!$post || $postAuthorId !== $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền tải lên ảnh cho bài viết này'
                ], 403);
            }

            $results = $this->uploadService->uploadMultiplePostImages(
                $request->file('images'),
                $postId
            );

            // Save uploaded image paths to post multimedia
            $paths = [];
            foreach ($results as $result) {
                \App\Models\PostMultimedia::create([
                    'post_id' => $postId,
                    'type' => 'image',
                    'file_url' => $result['path']
                ]);
                $paths[] = ['path' => $result['path']];
            }

            return response()->json([
                'success' => true,
                'message' => 'Tải lên ảnh bài viết thành công',
                'data' => $paths
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải lên ảnh bài viết',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete image
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function deleteImage(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'path' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $path = $request->input('path');
            $deleted = $this->uploadService->deleteImage($path);

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Xóa ảnh thành công'
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Ảnh không tồn tại'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa ảnh',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

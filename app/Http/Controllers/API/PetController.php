<?php

namespace App\Http\Controllers\API;

use App\Services\PetService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PetController extends Controller
{
    protected PetService $petService;

    public function __construct(PetService $petService)
    {
        $this->petService = $petService;
    }

    /**
     * Get pet by ID with owner information
     *
     * @param string $petId
     * @return JsonResponse
     */
    public function show(string $petId): JsonResponse
    {
        try {
            $pet = $this->petService->getPetWithOwner($petId);
            
            if (!$pet) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thú cưng không tồn tại'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $pet
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thông tin thú cưng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all pets for a user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUserPets(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $pets = $this->petService->getUserPets($request->user_id);

            return response()->json([
                'success' => true,
                'data' => $pets
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách thú cưng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new pet
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'species' => 'required|string|max:255',
                'breed' => 'nullable|string|max:255',
                'gender' => 'required|in:male,female',
                'age' => 'nullable|integer|min:0',
                'description' => 'nullable|string|max:1000',
                'avatar_url' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $pet = $this->petService->createPet(
                $request->user()->id,
                $request->only(['name', 'species', 'breed', 'gender', 'age', 'description', 'avatar_url'])
            );

            return response()->json([
                'success' => true,
                'message' => 'Tạo thú cưng thành công',
                'data' => $pet
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo thú cưng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update pet information
     *
     * @param Request $request
     * @param string $petId
     * @return JsonResponse
     */
    public function update(Request $request, string $petId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'nullable|string|max:255',
                'species' => 'nullable|string|max:255',
                'breed' => 'nullable|string|max:255',
                'gender' => 'nullable|in:male,female',
                'age' => 'nullable|integer|min:0',
                'description' => 'nullable|string|max:1000',
                'avatar_url' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $pet = $this->petService->updatePet($petId, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thú cưng thành công',
                'data' => $pet
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật thú cưng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a pet
     *
     * @param string $petId
     * @return JsonResponse
     */
    public function destroy(string $petId): JsonResponse
    {
        try {
            $this->petService->deletePet($petId);

            return response()->json([
                'success' => true,
                'message' => 'Xóa thú cưng thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa thú cưng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle like status for a pet
     *
     * @param Request $request
     * @param string $petId
     * @return JsonResponse
     */
    public function toggleLike(Request $request, string $petId): JsonResponse
    {
        try {
            $result = $this->petService->togglePetLike($request->user()->id, $petId);

            return response()->json([
                'success' => true,
                'message' => $result['action'] === 'liked' ? 'Đã thích thú cưng' : 'Đã hủy thích thú cưng',
                'data' => $result
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Thú cưng không tồn tại',
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
     * Get like count for a pet
     *
     * @param string $petId
     * @return JsonResponse
     */
    public function getLikeCount(string $petId): JsonResponse
    {
        try {
            $count = $this->petService->getPetLikeCount($petId);

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
     * Get pets with pagination
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            $currentUserId = $request->user() ? $request->user()->id : null;

            $pets = $this->petService->getPetsPaginated($page, $perPage, $currentUserId);

            return response()->json([
                'success' => true,
                'data' => $pets
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách thú cưng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search pets by name or species
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

            $pets = $this->petService->searchPets($request->query('query'));

            return response()->json([
                'success' => true,
                'data' => $pets
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tìm kiếm thú cưng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if user has liked a pet
     *
     * @param Request $request
     * @param string $petId
     * @return JsonResponse
     */
    public function hasLiked(Request $request, string $petId): JsonResponse
    {
        try {
            $isLiked = $this->petService->hasLikedPet($request->user()->id, $petId);

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
}

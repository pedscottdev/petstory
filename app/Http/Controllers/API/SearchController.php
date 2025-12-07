<?php

namespace App\Http\Controllers\API;

use App\Services\SearchService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class SearchController extends Controller
{
    protected SearchService $searchService;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * Search users and pets by query
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

            $currentUserId = $request->user() ? $request->user()->id : null;
            $limit = $request->get('limit', 20);

            $results = $this->searchService->searchUsersAndPets(
                $request->query('query'),
                $currentUserId,
                $limit
            );

            return response()->json([
                'success' => true,
                'data' => $results
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tìm kiếm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get search suggestions (5 users and 5 pets from following/followers)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getSuggestions(Request $request): JsonResponse
    {
        try {
            $currentUserId = $request->user()->id;

            $suggestions = $this->searchService->getSearchSuggestions($currentUserId);

            return response()->json([
                'success' => true,
                'data' => $suggestions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy gợi ý tìm kiếm',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}


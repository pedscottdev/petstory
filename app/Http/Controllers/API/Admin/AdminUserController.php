<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * Get list of users (excluding admins) with search, filter, and pagination.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', '!=', 'admin');

        // Search by name (first_name or last_name)
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        // Filter by status (is_active)
        if ($request->has('status') && $request->status !== 'all') {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        // Filter by join date range
        if ($request->has('from_date') && !empty($request->from_date)) {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $query->where('created_at', '>=', $fromDate);
        }

        if ($request->has('to_date') && !empty($request->to_date)) {
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $query->where('created_at', '<=', $toDate);
        }

        // Order by created_at descending (newest first)
        $query->orderBy('created_at', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 10);
        $users = $query->paginate($perPage);

        // Transform users data
        $transformedUsers = $users->getCollection()->map(function ($user) {
            return [
                'id' => (string) $user->_id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'avatar' => $user->avatar_url,
                'bio' => $user->bio,
                'status' => $user->is_active ? 'Active' : 'Inactive',
                'is_active' => $user->is_active,
                'join_date' => $user->created_at ? $user->created_at->format('Y-m-d') : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $transformedUsers,
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ],
            ],
        ]);
    }

    /**
     * Toggle user active status (activate/deactivate).
     *
     * @param string $userId
     * @return JsonResponse
     */
    public function toggleStatus(string $userId): JsonResponse
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại.',
            ], 404);
        }

        // Prevent toggling admin users
        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Không thể thay đổi trạng thái của quản trị viên.',
            ], 403);
        }

        // Toggle is_active status
        $user->is_active = !$user->is_active;
        $user->save();

        $statusMessage = $user->is_active 
            ? 'Người dùng đã được kích hoạt thành công.'
            : 'Người dùng đã bị vô hiệu hóa thành công.';

        return response()->json([
            'success' => true,
            'message' => $statusMessage,
            'data' => [
                'user' => [
                    'id' => (string) $user->_id,
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'is_active' => $user->is_active,
                    'status' => $user->is_active ? 'Active' : 'Inactive',
                ],
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers\API;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get notifications for authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()->id;
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 5);

            $notifications = $this->notificationService->getNotifications($userId, $page, $perPage);

            return response()->json([
                'success' => true,
                'data' => $notifications
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách thông báo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark a notification as read
     *
     * @param Request $request
     * @param string $notificationId
     * @return JsonResponse
     */
    public function markAsRead(Request $request, string $notificationId): JsonResponse
    {
        try {
            $userId = $request->user()->id;
            $success = $this->notificationService->markAsRead($notificationId, $userId);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thông báo không tồn tại'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Đã đánh dấu đã đọc'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi đánh dấu đã đọc',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()->id;
            $this->notificationService->markAllAsRead($userId);

            return response()->json([
                'success' => true,
                'message' => 'Đã đánh dấu tất cả là đã đọc'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi đánh dấu tất cả là đã đọc',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as received
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function markAsReceived(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()->id;
            $this->notificationService->markAsReceived($userId);

            return response()->json([
                'success' => true,
                'message' => 'Đã đánh dấu đã nhận'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi đánh dấu đã nhận',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unread notifications count
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUnreadCount(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()->id;
            $count = $this->notificationService->getUnreadCount($userId);

            return response()->json([
                'success' => true,
                'data' => ['count' => $count]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy số lượng thông báo chưa đọc',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unreceived notifications count
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUnreceivedCount(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()->id;
            $count = $this->notificationService->getUnreceivedCount($userId);

            return response()->json([
                'success' => true,
                'data' => ['count' => $count]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy số lượng thông báo chưa nhận',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}


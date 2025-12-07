<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Post;
use App\Models\Pet;
use Illuminate\Pagination\LengthAwarePaginator;

class NotificationService
{
    /**
     * Create a new notification
     *
     * @param string $userId The user who will receive the notification
     * @param string $type Notification type
     * @param string $actorId The user who triggered the notification
     * @param array $data Additional data (post_id, post_content, pet_id, pet_name)
     * @return Notification
     */
    public function createNotification(string $userId, string $type, string $actorId, array $data = []): Notification
    {
        // Get actor information
        $actor = User::find($actorId);
        if (!$actor) {
            throw new \Exception('Actor not found');
        }

        $actorName = $actor->last_name . ' ' . $actor->first_name;
        $actorAvatar = $actor->avatar_url;

        // Build message based on type
        $message = '';
        $postContentPreview = null;
        $petName = null;

        switch ($type) {
            case Notification::TYPE_LIKE_POST:
                $postContent = $data['post_content'] ?? '';
                $postContentPreview = $this->getPostContentPreview($postContent);
                $message = $actorName . ' đã thích bài viết "' . $postContentPreview . '"';
                break;

            case Notification::TYPE_COMMENT:
                $postContent = $data['post_content'] ?? '';
                $postContentPreview = $this->getPostContentPreview($postContent);
                $message = $actorName . ' đã bình luận bài viết "' . $postContentPreview . '"';
                break;

            case Notification::TYPE_FOLLOW:
                $message = $actorName . ' đã bắt đầu theo dõi bạn.';
                break;

            case Notification::TYPE_LIKE_PET:
                $petName = $data['pet_name'] ?? '';
                $message = $actorName . ' đã thích thú cưng ' . $petName . '.';
                break;
        }

        // Create notification
        $notification = Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'reference_id' => $data['post_id'] ?? $data['pet_id'] ?? null,
            'message' => $message,
            'is_read' => false,
            'is_received' => false,
            'actor_id' => $actorId,
            'actor_name' => $actorName,
            'actor_avatar' => $actorAvatar,
            'post_content_preview' => $postContentPreview,
            'pet_name' => $petName,
        ]);

        return $notification;
    }

    /**
     * Get first 6 characters of post content
     *
     * @param string $content
     * @return string
     */
    private function getPostContentPreview(string $content): string
    {
        $trimmed = trim($content);

        $words = preg_split('/\s+/', $trimmed);
        $previewWords = array_slice($words, 0, 6);
        $preview = implode(' ', $previewWords);
        if (count($words) > 6) {
            $preview .= '...';
        }

        return $preview;
    }

    /**
     * Get notifications for a user with pagination
     *
     * @param string $userId
     * @param int $page
     * @param int $perPage
     * @return array
     */
    public function getNotifications(string $userId, int $page = 1, int $perPage = 5): array
    {
        $notifications = Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $formattedNotifications = $notifications->map(function ($notification) {
            return [
                'id' => $notification->id,
                '_id' => $notification->id,
                'type' => $notification->type,
                'user' => [
                    'id' => $notification->actor_id,
                    'name' => $notification->actor_name,
                    'avatar' => $notification->actor_avatar,
                ],
                'text' => $this->getNotificationText($notification),
                'postTitle' => $notification->post_content_preview,
                'petName' => $notification->pet_name,
                'isRead' => $notification->is_read,
                'is_read' => $notification->is_read,
                'created_at' => $notification->created_at,
            ];
        })->toArray();

        return [
            'data' => $formattedNotifications,
            'current_page' => $notifications->currentPage(),
            'last_page' => $notifications->lastPage(),
            'per_page' => $notifications->perPage(),
            'total' => $notifications->total(),
        ];
    }

    /**
     * Get notification text based on type
     *
     * @param Notification $notification
     * @return string
     */
    private function getNotificationText(Notification $notification): string
    {
        switch ($notification->type) {
            case Notification::TYPE_LIKE_POST:
                return 'đã thích bài viết';
            case Notification::TYPE_COMMENT:
                return 'đã bình luận bài viết';
            case Notification::TYPE_FOLLOW:
                return 'đã bắt đầu theo dõi bạn';
            case Notification::TYPE_LIKE_PET:
                return 'đã thích thú cưng của bạn';
            default:
                return '';
        }
    }

    /**
     * Mark a notification as read
     *
     * @param string $notificationId
     * @param string $userId
     * @return bool
     */
    public function markAsRead(string $notificationId, string $userId): bool
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $userId)
            ->first();

        if (!$notification) {
            return false;
        }

        $notification->is_read = true;
        return $notification->save();
    }

    /**
     * Mark all notifications as read for a user
     *
     * @param string $userId
     * @return bool
     */
    public function markAllAsRead(string $userId): bool
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]) >= 0;
    }

    /**
     * Mark all notifications as received for a user
     *
     * @param string $userId
     * @return bool
     */
    public function markAsReceived(string $userId): bool
    {
        return Notification::where('user_id', $userId)
            ->where('is_received', false)
            ->update(['is_received' => true]) >= 0;
    }

    /**
     * Get unread notifications count
     *
     * @param string $userId
     * @return int
     */
    public function getUnreadCount(string $userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Get unreceived notifications count
     *
     * @param string $userId
     * @return int
     */
    public function getUnreceivedCount(string $userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('is_received', false)
            ->count();
    }
}

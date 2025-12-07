<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * NotificationCreated Event
 *
 * Broadcasts a notification to the user when a new notification is created.
 * Uses a private channel specific to the recipient user.
 * Implements ShouldBroadcastNow to broadcast immediately without queueing.
 */
class NotificationCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The notification instance.
     *
     * @var \App\Models\Notification
     */
    public Notification $notification;

    /**
     * Create a new event instance.
     *
     * @param \App\Models\Notification $notification
     */
    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Broadcast on private channel specific to the recipient user
        return [
            new PrivateChannel('user.' . $this->notification->user_id),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            '_id' => $this->notification->id,
            'type' => $this->notification->type,
            'actor' => [
                'id' => $this->notification->actor_id,
                'name' => $this->notification->actor_name,
                'avatar' => $this->notification->actor_avatar,
            ],
            'user' => [
                'id' => $this->notification->actor_id,
                'name' => $this->notification->actor_name,
                'avatar' => $this->notification->actor_avatar,
            ],
            'message' => $this->notification->message,
            'text' => $this->getNotificationText(),
            'postTitle' => $this->notification->post_content_preview,
            'petName' => $this->notification->pet_name,
            'isRead' => $this->notification->is_read,
            'is_read' => $this->notification->is_read,
            'created_at' => $this->notification->created_at,
        ];
    }

    /**
     * Get notification text based on type
     *
     * @return string
     */
    private function getNotificationText(): string
    {
        switch ($this->notification->type) {
            case \App\Models\Notification::TYPE_LIKE_POST:
                return 'đã thích bài viết';
            case \App\Models\Notification::TYPE_COMMENT:
                return 'đã bình luận bài viết';
            case \App\Models\Notification::TYPE_FOLLOW:
                return 'đã bắt đầu theo dõi bạn';
            case \App\Models\Notification::TYPE_LIKE_PET:
                return 'đã thích thú cưng của bạn';
            default:
                return '';
        }
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'notification.created';
    }
}


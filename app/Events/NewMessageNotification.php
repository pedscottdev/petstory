<?php

namespace App\Events;

use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * NewMessageNotification Event
 *
 * Broadcasts a notification to the recipient when a new message is sent.
 * Uses a private channel specific to the recipient user.
 * Implements ShouldBroadcastNow to broadcast immediately without queueing.
 */
class NewMessageNotification implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The message instance.
     *
     * @var \App\Models\Message
     */
    public Message $message;

    /**
     * The recipient user ID.
     *
     * @var string
     */
    public string $recipientId;

    /**
     * The conversation's unread count for the recipient.
     *
     * @var int
     */
    public int $unreadCount;

    /**
     * Create a new event instance.
     *
     * @param \App\Models\Message $message
     * @param string $recipientId
     * @param int $unreadCount
     */
    public function __construct(Message $message, string $recipientId, int $unreadCount = 1)
    {
        $this->message = $message;
        $this->recipientId = $recipientId;
        $this->unreadCount = $unreadCount;
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
            new PrivateChannel('user.' . $this->recipientId),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        // Get sender info
        $sender = User::find($this->message->sender_id);
        
        return [
            'conversation_id' => $this->message->conversation_id,
            'message_id' => $this->message->id ?? $this->message->_id,
            'sender' => [
                'id' => $sender->id ?? $sender->_id ?? null,
                'name' => $sender ? ($sender->first_name . ' ' . $sender->last_name) : 'Unknown',
                'avatar_url' => $sender->avatar_url ?? null,
            ],
            'content_preview' => mb_substr($this->message->content ?? '', 0, 50),
            'has_image' => !empty($this->message->image_url),
            'unread_count' => $this->unreadCount,
            'created_at' => $this->message->created_at,
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'new-message-notification';
    }
}

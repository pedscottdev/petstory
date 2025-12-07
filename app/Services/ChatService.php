<?php

namespace App\Services;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Pagination\Paginator;

/**
 * ChatService
 *
 * Handles all chat-related operations including sending messages, retrieving conversation history,
 * and broadcasting messages via Reverb.
 */
class ChatService
{
    /**
     * Send a message to a conversation and broadcast it via Reverb.
     *
     * @param \App\Models\User $sender The user sending the message
     * @param string $conversationId The conversation ID
     * @param string $content The message content
     *
     * @return \App\Models\Message
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function sendMessage(User $sender, string $conversationId, string $content): Message
    {
        // Verify that the sender is a member of the conversation
        // Handle MongoDB ID format inconsistencies
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            // Try finding by _id or id fields explicitly
            $conversation = Conversation::where('_id', $conversationId)->orWhere('id', $conversationId)->first();
        }

        if (!$conversation) {
            throw new \Exception('Conversation not found.');
        }

        $isMember = $conversation->hasMember($sender->id);

        if (!$isMember) {
            throw new \Exception('User is not a member of this conversation.');
        }

        // Create the message
        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => $sender->id,
            'content' => $content,
        ]);

        // Broadcast the message event to all users in the conversation (except the sender)
        // The toOthers() method ensures the sender doesn't receive their own message
        broadcast(new MessageSent($message))->toOthers();

        return $message;
    }

    /**
     * Get all messages for a conversation with pagination.
     *
     * @param string $conversationId The conversation ID
     * @param int $perPage Number of messages per page (default: 50)
     *
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getMessages(string $conversationId, int $perPage = 50)
    {
        return Message::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);
    }
}

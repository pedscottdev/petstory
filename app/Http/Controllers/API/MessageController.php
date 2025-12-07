<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * MessageController
 *
 * Handles API endpoints for retrieving and sending messages in conversations.
 * All endpoints require auth:sanctum middleware.
 */
class MessageController extends Controller
{
    /**
     * ChatService instance.
     *
     * @var \App\Services\ChatService
     */
    protected ChatService $chatService;

    /**
     * Create a new controller instance.
     *
     * @param \App\Services\ChatService $chatService
     */
    public function __construct(ChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    /**
     * Get all messages for a conversation.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $conversationId The conversation ID
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request, string $conversationId): JsonResponse
    {
        $user = $request->user();

        // Verify that the conversation exists and user is a member
        // Handle MongoDB ID format inconsistencies
        $conversation = Conversation::find($conversationId);
        if (!$conversation) {
            // Try finding by _id or id fields explicitly
            $conversation = Conversation::where('_id', $conversationId)->orWhere('id', $conversationId)->first();
        }

        if (!$conversation) {
            return response()->json(
                ['message' => 'Conversation not found.'],
                Response::HTTP_NOT_FOUND
            );
        }

        // Check if user is a member (works with both SQL and MongoDB)
        // Load users to ensure relationship is loaded
        $conversation->load('users');
        $isMember = $conversation->hasMember($user->id);

        if (!$isMember) {
            return response()->json(
                ['message' => 'User is not a member of this conversation.'],
                Response::HTTP_FORBIDDEN
            );
        }

        // Get messages with pagination
        $messages = $this->chatService->getMessages($conversationId);

        return response()->json(
            [
                'success' => true,
                'data' => $messages->items(),
                'pagination' => [
                    'current_page' => $messages->currentPage(),
                    'per_page' => $messages->perPage(),
                    'total' => $messages->total(),
                    'last_page' => $messages->lastPage(),
                    'from' => $messages->firstItem(),
                    'to' => $messages->lastItem(),
                ],
            ],
            Response::HTTP_OK
        );
    }

    /**
     * Store a new message in a conversation.
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validate input
            $validated = $request->validate([
                'conversation_id' => 'required|string',
                'content' => 'nullable|string|max:5000',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            $user = $request->user();
            $conversationId = $validated['conversation_id'];
            $content = $validated['content'] ?? '';

            // Log request data for debugging
            Log::info('MessageController.store request', [
                'conversation_id' => $conversationId,
                'user_id' => $user->id,
                'has_content' => !empty($content),
                'has_image' => $request->hasFile('image'),
                'all_inputs' => $request->all(),
            ]);

            // Verify conversation exists and user is a member
            // Handle MongoDB ID format inconsistencies
            $conversation = Conversation::find($conversationId);
            if (!$conversation) {
                // Try finding by _id or id fields explicitly
                $conversation = Conversation::where('_id', $conversationId)->orWhere('id', $conversationId)->first();
            }

            if (!$conversation) {
                return response()->json(
                    ['message' => 'Conversation not found.'],
                    Response::HTTP_NOT_FOUND
                );
            }

            // Load users to ensure relationship is loaded
            $conversation->load('users');
            $isMember = $conversation->hasMember($user->id);

            // Log membership debug info
            Log::info('MessageController.store membership check', [
                'conversation_id' => $conversationId,
                'user_id' => $user->id,
                'conversation_user_ids' => $conversation->user_ids ?? null,
                'hasMember' => $isMember,
            ]);

            if (!$isMember) {
                return response()->json(
                    ['message' => 'User is not a member of this conversation.'],
                    Response::HTTP_FORBIDDEN
                );
            }

            // Handle image upload if provided
            $imageUrl = null;
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $path = "uploads/chats/{$conversationId}";

                // Store image
                $imagePath = $image->storeAs($path, $imageName, 'public');
                $imageUrl = asset('storage/' . $imagePath);
            }

            // Get recipient ID (the other user in the conversation)
            $recipientId = null;
            foreach ($conversation->users as $u) {
                if ((string) $u->id !== (string) $user->id) {
                    $recipientId = (string) $u->id;
                    break;
                }
            }

            // Create message with is_read = false for new messages
            $message = \App\Models\Message::create([
                'conversation_id' => $conversationId,
                'sender_id' => $user->id,
                'receiver_id' => $recipientId,
                'content' => $content,
                'image_url' => $imageUrl,
                'is_read' => false,
            ]);

            // Broadcast the message event to all users in the conversation
            broadcast(new \App\Events\MessageSent($message))->toOthers();

            // Broadcast notification to recipient for unread count update
            if ($recipientId) {
                // Count unread messages for recipient in this conversation
                $unreadCount = \App\Models\Message::where('conversation_id', $conversationId)
                    ->where('sender_id', '!=', $recipientId)
                    ->where('is_read', false)
                    ->count();

                broadcast(new \App\Events\NewMessageNotification($message, $recipientId, $unreadCount));
            }

            return response()->json(
                [
                    'success' => true,
                    'data' => $message,
                    'message' => 'Message sent successfully.',
                ],
                Response::HTTP_CREATED
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('MessageController.store validation error', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        } catch (\Exception $e) {
            Log::error('MessageController.store exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(
                [
                    'success' => false,
                    'message' => $e->getMessage(),
                ],
                Response::HTTP_BAD_REQUEST
            );
        }
    }
}

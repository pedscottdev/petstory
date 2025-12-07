<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

Log::info('CHANNELS.PHP LOADED');

// Channel cá nhân cho User (nếu cần dùng tới)
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

/**
 * Private channel cho từng cuộc hội thoại (1-1 cũng dùng cái này).
 */
Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    if (!$user) {
        Log::error('Broadcasting auth failed: User is null');
        return false;
    }

    Log::info('Broadcasting auth attempt', [
        'user_id' => $user->id,
        'conversation_id' => $conversationId,
    ]);
    
    // Tìm conversation - try both _id and id for MongoDB compatibility
    $conversation = Conversation::find($conversationId)
        ?? Conversation::where('_id', $conversationId)->orWhere('id', $conversationId)->first();
    
    if (!$conversation) {
        Log::warning('Conversation not found', ['conversation_id' => $conversationId]);
        return false;
    }
    
    // Load users relationship to ensure hasMember works correctly
    $conversation->load('users');
    
    // Kiểm tra quyền - hasMember expects user ID, not user object
    $isMember = $conversation->hasMember($user->id);
    
    Log::info('Broadcasting auth result', [
        'user_id' => $user->id,
        'conversation_id' => $conversationId,
        'is_member' => $isMember,
        'conversation_user_ids' => $conversation->user_ids ?? 'not set',
    ]);
    
    return $isMember;
});

// Broadcast::channel('chat.{conversationId}', function ( $user = null, $conversationId) {
//     Log::info('Broadcast auth debug', [
//         'user_id'        => optional($user)->id,
//         'conversation_id' => $conversationId,
//     ]);

//     return true; // TẠM THỜI cho qua hết để test auth
// });


/**
 * Public channel cho trạng thái online của user
 * Không cần authorization vì là public channel
 * Được sử dụng bởi UserOnlineStatusChanged event
 */

/**
 * Private channel cho thông báo tin nhắn mới đến user
 * Chỉ user đó mới có quyền nhận thông báo
 * Được sử dụng bởi NewMessageNotification event
 */
Broadcast::channel('user.{userId}', function ($user, $userId) {
    if (!$user) {
        return false;
    }
    
    // User can only subscribe to their own channel
    return (string) $user->id === (string) $userId;
});

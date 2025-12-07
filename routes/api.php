<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\PetController;
use App\Http\Controllers\API\PostController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\GroupController;
use App\Http\Controllers\API\ImageUploadController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\ConversationController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\SearchController;
use App\Http\Controllers\API\Admin\AdminDashboardController;
use App\Http\Controllers\API\Admin\AdminUserController;
use App\Http\Controllers\API\Admin\AdminPostController;
use App\Http\Controllers\API\Admin\AdminReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast; 
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('auth/login', [AuthController::class, 'loginUser']);
Route::post('auth/admin-login', [AuthController::class, 'loginAdmin']);
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum'); // Legacy - auto-detects role
Route::post('auth/user-logout', [AuthController::class, 'logoutUser'])->middleware('auth:sanctum'); // User portal logout
Route::post('auth/admin-logout', [AuthController::class, 'logoutAdmin'])->middleware('auth:sanctum'); // Admin portal logout
Route::post('auth/generate-otp', [AuthController::class, 'generateOTP']);
Route::post('auth/verify-otp', [AuthController::class, 'verifyOTP']);
Route::post('auth/confirm-password', [AuthController::class, 'confirmNewPassword']);
Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');

// Pet CRUD routes
Route::middleware('auth:sanctum')->group(function () {
  // Pet endpoints
  Route::get('pets', [PetController::class, 'index']);
  Route::get('pets/search', [PetController::class, 'search']);
  Route::post('pets', [PetController::class, 'store']);
  Route::get('pets/{petId}', [PetController::class, 'show']);
  Route::put('pets/{petId}', [PetController::class, 'update']);
  Route::delete('pets/{petId}', [PetController::class, 'destroy']);
  Route::get('pets/{petId}/like-count', [PetController::class, 'getLikeCount']);
  Route::get('pets/{petId}/is-liked', [PetController::class, 'hasLiked']);
  Route::post('pets/{petId}/toggle-like', [PetController::class, 'toggleLike']);
  Route::get('users/{userId}/pets', [PetController::class, 'getUserPets']);

  // Post endpoints
  Route::get('posts/feed/filtered', [PostController::class, 'getFilteredFeed']);
  Route::get('posts/feed', [PostController::class, 'getUserFeed']);
  Route::get('posts', [PostController::class, 'index']); // Placeholder for listing posts
  Route::post('posts', [PostController::class, 'store']);
  Route::get('posts/{postId}', [PostController::class, 'show']);
  Route::put('posts/{postId}', [PostController::class, 'update']);
  Route::delete('posts/{postId}', [PostController::class, 'destroy']);
  Route::get('posts/{postId}/like-count', [PostController::class, 'getLikeCount']);
  Route::get('posts/{postId}/is-liked', [PostController::class, 'hasLiked']);
  Route::post('posts/{postId}/toggle-like', [PostController::class, 'toggleLike']);
  Route::get('posts/{postId}/comments', [PostController::class, 'getComments']);
  Route::post('posts/{postId}/comments', [PostController::class, 'addComment']);
  Route::post('posts/{postId}/comments/{commentId}/replies', [PostController::class, 'addReply']);
  Route::delete('comments/{commentId}', [PostController::class, 'deleteComment']);
  Route::post('posts/{postId}/reports', [PostController::class, 'reportPost']);
  Route::get('groups/{groupId}/posts', [PostController::class, 'getGroupPosts']);
  Route::get('users/{userId}/posts', [PostController::class, 'getUserPosts']);

  // User endpoints
  Route::get('users', [UserController::class, 'index']);
  Route::get('users/newfeed-data', [UserController::class, 'getNewfeedData']);
  Route::get('users/profile/{userId}', [UserController::class, 'getProfile']);
  Route::get('users/{userId}/with-pets', [UserController::class, 'getUserWithPets']);
  Route::put('users/profile', [UserController::class, 'updateProfile']);
  Route::post('users/change-password', [UserController::class, 'changePassword']);
  Route::get('users/initial-suggestions', [UserController::class, 'getInitialSuggestionsData']);
  Route::get('users/prominent', [UserController::class, 'getProminentUsers']);
  Route::get('users/suggestions', [UserController::class, 'getUserSuggestions']);
  Route::get('users/people-you-may-know', [UserController::class, 'getPeopleYouMayKnow']);
  Route::get('users/{userId}/followers', [UserController::class, 'getFollowers']);
  Route::get('users/{userId}/following', [UserController::class, 'getFollowing']);
  Route::get('users/{userId}/is-following', [UserController::class, 'isFollowing']);
  Route::post('users/{followingId}/toggle-follow', [UserController::class, 'toggleFollow']);

  // Group endpoints
  Route::get('groups', [GroupController::class, 'index']);
  Route::get('groups/search', [GroupController::class, 'search']);
  Route::post('groups', [GroupController::class, 'store']);
  Route::get('groups/{groupId}', [GroupController::class, 'show']);
  Route::put('groups/{groupId}', [GroupController::class, 'update']);
  Route::delete('groups/{groupId}', [GroupController::class, 'destroy']);
  Route::get('groups/{groupId}/posts', [GroupController::class, 'getPosts']);
  Route::get('groups/{groupId}/members', [GroupController::class, 'getMembers']);
  Route::get('groups/{groupId}/is-member/{userId}', [GroupController::class, 'isMember']);
  Route::post('groups/{groupId}/members', [GroupController::class, 'addMember']);
  Route::delete('groups/{groupId}/members/{userId}', [GroupController::class, 'removeMember']);
  Route::put('groups/{groupId}/members/{userId}/role', [GroupController::class, 'changeMemberRole']);
  Route::get('users/groups', [GroupController::class, 'getUserGroups']);
  Route::get('users/groups/created', [GroupController::class, 'getMyCreatedGroups']);

  // Image upload endpoints
  Route::post('upload/user-avatar', [ImageUploadController::class, 'uploadUserAvatar']);
  Route::post('upload/pet-avatar', [ImageUploadController::class, 'uploadPetAvatar']);
  Route::post('upload/group-avatar', [ImageUploadController::class, 'uploadGroupAvatar']);
  Route::post('upload/group-cover', [ImageUploadController::class, 'uploadGroupCover']);
  Route::post('upload/post-images', [ImageUploadController::class, 'uploadPostImages']);
  Route::post('upload/delete-image', [ImageUploadController::class, 'deleteImage']);

  // Conversation endpoints (CRUD + member management)
  // IMPORTANT: Specific routes MUST come before wildcard routes
  Route::get('conversations', [ConversationController::class, 'index']);
  Route::get('conversations/suggestions', [ConversationController::class, 'getSuggestedUsers']);
  Route::post('conversations', [ConversationController::class, 'store']);
  Route::post('conversations/get-or-create', [ConversationController::class, 'getOrCreateConversation']);
  
  // Wildcard routes (with {conversation} parameter)
  Route::get('conversations/{conversation}', [ConversationController::class, 'show']);
  Route::put('conversations/{conversation}', [ConversationController::class, 'update']);
  Route::delete('conversations/{conversation}', [ConversationController::class, 'destroy']);
  Route::get('conversations/{conversation}/members', [ConversationController::class, 'getMembers']);
  Route::post('conversations/{conversation}/members', [ConversationController::class, 'addMember']);
  Route::delete('conversations/{conversation}/members/{user}', [ConversationController::class, 'removeMember']);
  Route::get('conversations/{conversation}/messages', [MessageController::class, 'index']);
  Route::post('conversations/{conversation}/read', [ConversationController::class, 'markAsRead']);
  
  // Message endpoints
  Route::post('messages', [MessageController::class, 'store']);

  // Notification endpoints
  Route::get('notifications', [NotificationController::class, 'index']);
  Route::get('notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
  Route::get('notifications/unreceived-count', [NotificationController::class, 'getUnreceivedCount']);
  Route::put('notifications/received', [NotificationController::class, 'markAsReceived']);
  Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
  Route::put('notifications/{notificationId}/read', [NotificationController::class, 'markAsRead']);

  // Search endpoints
  Route::get('search', [SearchController::class, 'search']);
  Route::get('search/suggestions', [SearchController::class, 'getSuggestions']);
});

// Admin routes
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('dashboard/stats', [AdminDashboardController::class, 'getStats']);
    
    // User management routes
    Route::get('users', [AdminUserController::class, 'index']);
    Route::put('users/{userId}/toggle-status', [AdminUserController::class, 'toggleStatus']);

    // Post management routes
    Route::get('posts', [AdminPostController::class, 'index']);
    Route::put('posts/{postId}/toggle-block', [AdminPostController::class, 'toggleBlock']);

    // Report management routes
    Route::get('reports', [AdminReportController::class, 'index']);
    Route::put('reports/{reportId}/resolve', [AdminReportController::class, 'resolve']);
    Route::get('reports/post/{postId}', [AdminReportController::class, 'getPostDetails']);
});

Broadcast::routes(['middleware' => ['api', 'auth:sanctum']]);
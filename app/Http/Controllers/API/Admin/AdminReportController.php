<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Post;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminReportController extends Controller
{
    /**
     * Get list of reports with filter and pagination for admin management.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Report::with(['reporter', 'post', 'post.author', 'targetUser']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by target type
        if ($request->has('target_type') && $request->target_type !== 'all') {
            $query->where('target_type', $request->target_type);
        }

        // Order by created_at descending (newest first)
        $query->orderBy('created_at', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 10);
        $reports = $query->paginate($perPage);

        // Transform reports data
        $transformedReports = collect($reports->items())->map(function ($report) {
            $reporter = $report->reporter;
            
            // Determine target info based on target_type
            $targetType = $report->target_type ?? 'post';
            $targetTitle = '';
            $targetId = null;
            
            if ($targetType === 'post' && $report->post) {
                $post = $report->post;
                // Use first 50 chars of content as title
                $targetTitle = mb_strlen($post->content) > 50 
                    ? mb_substr($post->content, 0, 50) . '...' 
                    : $post->content;
                $targetId = (string) $post->_id;
            } elseif ($targetType === 'user' && $report->targetUser) {
                $targetUser = $report->targetUser;
                $targetTitle = $targetUser->first_name . ' ' . $targetUser->last_name;
                $targetId = (string) $targetUser->_id;
            }

            return [
                'id' => (string) $report->_id,
                'reporter' => $reporter ? [
                    'id' => (string) $reporter->_id,
                    'name' => $reporter->first_name . ' ' . $reporter->last_name,
                    'avatar' => $reporter->avatar_url,
                ] : null,
                'reporter_name' => $reporter ? $reporter->first_name . ' ' . $reporter->last_name : 'Unknown',
                'target_type' => $targetType === 'post' ? 'Bài viết' : 'Người dùng',
                'target_type_raw' => $targetType,
                'target_id' => $targetId,
                'target_title' => $targetTitle,
                'reason' => $report->reason,
                'status' => $report->status ?? 'pending',
                'resolution' => $report->resolution,
                'date' => $report->created_at ? $report->created_at->format('Y-m-d') : null,
                'created_at' => $report->created_at ? $report->created_at->format('Y-m-d H:i:s') : null,
                'resolved_at' => $report->resolved_at ? $report->resolved_at->format('Y-m-d H:i:s') : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'reports' => $transformedReports,
                'pagination' => [
                    'current_page' => $reports->currentPage(),
                    'last_page' => $reports->lastPage(),
                    'per_page' => $reports->perPage(),
                    'total' => $reports->total(),
                ],
            ],
        ]);
    }

    /**
     * Resolve a report (confirm violation or no violation).
     *
     * @param Request $request
     * @param string $reportId
     * @return JsonResponse
     */
    public function resolve(Request $request, string $reportId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'resolution' => 'required|in:violation,no_violation',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $report = Report::find($reportId);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Báo cáo không tồn tại.',
            ], 404);
        }

        if ($report->status === 'resolved') {
            return response()->json([
                'success' => false,
                'message' => 'Báo cáo này đã được xử lý trước đó.',
            ], 400);
        }

        $resolution = $request->resolution;
        $targetType = $report->target_type ?? 'post';

        // If violation is confirmed, block the target
        if ($resolution === 'violation') {
            if ($targetType === 'post' && $report->post_id) {
                $post = Post::find($report->post_id);
                if ($post) {
                    $post->is_active = false;
                    $post->save();
                }
            } elseif ($targetType === 'user' && $report->target_user_id) {
                $user = User::find($report->target_user_id);
                if ($user) {
                    $user->is_active = false;
                    $user->save();
                }
            }
        }

        // Update report status
        $report->status = 'resolved';
        $report->resolution = $resolution;
        $report->resolved_at = Carbon::now();
        $report->resolved_by = $request->user()->id;
        $report->save();

        $message = $resolution === 'violation'
            ? 'Đã xác nhận vi phạm và chặn đối tượng.'
            : 'Đã xác nhận không vi phạm.';

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'report' => [
                    'id' => (string) $report->_id,
                    'status' => $report->status,
                    'resolution' => $report->resolution,
                    'resolved_at' => $report->resolved_at->format('Y-m-d H:i:s'),
                ],
            ],
        ]);
    }

    /**
     * Get post details for a report.
     *
     * @param string $postId
     * @return JsonResponse
     */
    public function getPostDetails(string $postId): JsonResponse
    {
        // Note: tagged_pets is an accessor, not a relationship, so don't eager load it
        $post = Post::with(['author', 'multimedia'])->find($postId);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Bài viết không tồn tại.',
            ], 404);
        }

        $author = $post->author;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => (string) $post->_id,
                'content' => $post->content,
                'is_active' => $post->is_active ?? true,
                'created_at' => $post->created_at ? $post->created_at->format('Y-m-d H:i:s') : null,
                'date' => $post->created_at ? $post->created_at->format('Y-m-d') : null,
                'author' => $author ? [
                    'id' => (string) $author->_id,
                    'name' => $author->first_name . ' ' . $author->last_name,
                    'avatar' => $author->avatar_url,
                ] : null,
                'multimedia' => collect($post->multimedia)->map(function ($media) {
                    return [
                        'id' => (string) $media->_id,
                        'type' => $media->type,
                        'file_url' => $media->file_url,
                    ];
                })->toArray(),
                // Access via the accessor attribute (tagged_pets)
                'tagged_pets' => collect($post->tagged_pets)->map(function ($pet) {
                    return [
                        'id' => (string) $pet->_id,
                        'name' => $pet->name,
                        'breed' => $pet->breed,
                        'avatar_url' => $pet->avatar_url,
                    ];
                })->toArray(),
            ],
        ]);
    }
}

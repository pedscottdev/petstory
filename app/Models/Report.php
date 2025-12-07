<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Report extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'mongodb';

    /**
     * The collection associated with the model.
     *
     * @var string
     */
    protected $collection = 'reports';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'reporter_id',
        'target_type',      // 'post' or 'user'
        'post_id',          // For post reports
        'target_user_id',   // For user reports
        'reason',           // Reason code (e.g., 'spam', 'inappropriate')
        'reason_text',      // Reason text in Vietnamese
        'status',           // 'pending' or 'resolved'
        'resolution',       // 'violation' or 'no_violation'
        'resolved_at',
        'resolved_by',
    ];

    /**
     * Reason codes and their text for post reports
     */
    public const POST_REASONS = [
        'inappropriate' => 'Ngôn từ phản cảm/bạo lực',
        'spam' => 'Spam hoặc quảng cáo',
        'misinformation' => 'Thông tin sai lệch',
        'hate' => 'Nội dung thù ghét, quấy rối',
        'other' => 'Khác',
    ];

    /**
     * Reason codes and their text for user reports
     */
    public const USER_REASONS = [
        'inappropriate' => 'Nội dung không phù hợp',
        'spam' => 'Spam hoặc quảng cáo',
        'hate' => 'Nội dung thù ghét, quấy rối',
        'fake_account' => 'Tài khoản giả mạo hoặc mạo danh',
        'illegal_pet_trade' => 'Mua bán thú cưng trái phép',
        'other' => 'Khác',
    ];

    /**
     * Get the reason text from reason code based on target type
     *
     * @param string $reasonCode
     * @param string $targetType 'post' or 'user'
     * @return string
     */
    public static function getReasonText(string $reasonCode, string $targetType = 'post'): string
    {
        if ($targetType === 'user') {
            return self::USER_REASONS[$reasonCode] ?? $reasonCode;
        }
        return self::POST_REASONS[$reasonCode] ?? $reasonCode;
    }

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    /**
     * Default attribute values
     *
     * @var array
     */
    protected $attributes = [
        'status' => 'pending',
        'target_type' => 'post',
    ];

    /**
     * Get the user who submitted the report.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /**
     * Get the post that was reported.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    /**
     * Get the user that was reported (for user reports).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    /**
     * Get the admin who resolved the report.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
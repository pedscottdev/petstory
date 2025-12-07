<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Conversation extends Model
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
    protected $collection = 'conversations';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'is_group',
        'creator_id',
        'description',
        'user_ids',  // For MongoDB - store user IDs as array
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_group' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the users in this conversation.
     * For MongoDB, users are stored as an array of user IDs in the document.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function users()
    {
        return $this->belongsToMany(
            User::class,
            'conversation_user',
            'conversation_id',
            'user_id'
        )->withTimestamps();
    }

    /**
     * Check if a user is a member of this conversation.
     * Accepts both User object or user ID (string/int).
     *
     * @param \App\Models\User|string|int $user
     * @return bool
     */
    public function hasMember($user): bool
    {
        if (!$user) {
            return false;
        }
        
        // Extract user ID from User object or use the ID directly
        $userId = $user instanceof User ? $user->id : $user;
        $userIdStr = (string) $userId;
        
        // First, try checking user_ids array (MongoDB field)
        if (isset($this->user_ids) && is_array($this->user_ids)) {
            foreach ($this->user_ids as $id) {
                if ((string) $id === $userIdStr) {
                    return true;
                }
            }
        }
        
        // If users relationship is loaded, check there
        if ($this->relationLoaded('users')) {
            foreach ($this->users as $u) {
                if ((string) $u->id === $userIdStr) {
                    return true;
                }
            }
        }
        
        // Fallback: query the pivot table relationship
        return $this->users()->where('user_id', $userId)->exists();
    }

    /**
     * Get the messages in this conversation.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'conversation_id');
    }

    /**
     * Get the creator of the conversation.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
}

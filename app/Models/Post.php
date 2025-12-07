<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Post extends Model
{
    use HasFactory;
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
    protected $collection = 'posts';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'author_id',
        'group_id',
        'content',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['tagged_pets'];

    /**
     * Get the author of the post.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Get the group that the post belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }

    /**
     * Get the multimedia for the post.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function multimedia()
    {
        return $this->hasMany(PostMultimedia::class, 'post_id');
    }

    /**
     * Get the likes for the post.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function likes()
    {
        return $this->hasMany(PostLike::class, 'post_id');
    }

    /**
     * Get the comments for the post.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function comments()
    {
        return $this->hasMany(Comment::class, 'post_id');
    }

    /**
     * Get the pets tagged in the post.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function postPets()
    {
        return $this->hasMany(PostPet::class, 'post_id');
    }

    /**
     * Get the pets tagged in the post with pet details.
     * Since hasManyThrough doesn't work well with MongoDB,
     * we manually fetch the pets using a custom accessor.
     */
    public function getTaggedPetsAttribute()
    {
        // Get pet IDs from post_pets collection
        $petIds = PostPet::where('post_id', $this->_id ?? $this->id)
            ->pluck('pet_id')
            ->toArray();
        
        if (empty($petIds)) {
            return collect([]);
        }
        
        // Fetch pets with details
        return Pet::whereIn('_id', $petIds)
            ->get(['_id', 'id', 'name', 'species', 'breed', 'avatar_url']);
    }
}
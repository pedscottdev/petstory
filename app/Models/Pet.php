<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pet extends Model
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
    protected $collection = 'pets';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'owner_id',
        'name',
        'species',
        'breed',
        'gender',
        'age',
        'description',
        'avatar_url',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'age' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    /**
     * Get the attributes that should be converted to dates.
     *
     * @return void
     */
    public function toArray()
    {
        $array = parent::toArray();
        // Ensure _id is included in the array representation
        if (!isset($array['_id']) && isset($this->_id)) {
            $array['_id'] = $this->_id;
        }
        // Also set 'id' as an alias for _id if it doesn't exist
        if (!isset($array['id']) && isset($this->_id)) {
            $array['id'] = $this->_id;
        }
        return $array;
    }

    /**
     * Get the owner of the pet.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the likes for the pet.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function likes()
    {
        return $this->hasMany(PetLike::class, 'pet_id');
    }
}
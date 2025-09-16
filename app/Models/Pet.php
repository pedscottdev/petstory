<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Pet extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string|null
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
        'name',
        'species',
        'breed',
        'age',
        'gender',
        'color',
        'weight',
        'height',
        'description',
        'owner_name',
        'owner_phone',
        'owner_email',
        'vaccination_status',
        'medical_history',
        'status',
        'image_url',
        'microchip_id',
        'registration_date',
        'last_checkup',
        'next_appointment',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'age' => 'integer',
        'weight' => 'decimal:2',
        'height' => 'decimal:2',
        'vaccination_status' => 'boolean',
        'registration_date' => 'datetime',
        'last_checkup' => 'datetime',
        'next_appointment' => 'datetime',
        'medical_history' => 'array',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'owner_phone',
        'owner_email',
    ];

    /**
     * Get the pets by species.
     *
     * @param string $species
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getBySpecies($species)
    {
        return static::where('species', $species)->get();
    }

    /**
     * Get active pets.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getActivePets()
    {
        return static::where('status', 'active')->get();
    }

    /**
     * Scope a query to only include pets of a given species.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $species
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfSpecies($query, $species)
    {
        return $query->where('species', $species);
    }

    /**
     * Scope a query to only include active pets.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Get the pet's full name with breed.
     *
     * @return string
     */
    public function getFullNameAttribute()
    {
        return $this->name . ' (' . $this->breed . ')';
    }

    /**
     * Get the pet's age in human-readable format.
     *
     * @return string
     */
    public function getAgeInWordsAttribute()
    {
        $age = $this->age;
        
        if ($age < 12) {
            return $age . ' month' . ($age !== 1 ? 's' : '') . ' old';
        }
        
        $years = floor($age / 12);
        $months = $age % 12;
        
        $result = $years . ' year' . ($years !== 1 ? 's' : '');
        
        if ($months > 0) {
            $result .= ' and ' . $months . ' month' . ($months !== 1 ? 's' : '');
        }
        
        return $result . ' old';
    }

    /**
     * Determine if the pet needs vaccination.
     *
     * @return bool
     */
    public function needsVaccination()
    {
        if (!$this->vaccination_status) {
            return true;
        }

        // Check if last checkup was more than 6 months ago
        if ($this->last_checkup && $this->last_checkup->diffInMonths(now()) > 6) {
            return true;
        }

        return false;
    }

    /**
     * Get pets that need vaccination.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function needingVaccination()
    {
        return static::where(function ($query) {
            $query->where('vaccination_status', false)
                  ->orWhere('last_checkup', '<', now()->subMonths(6));
        })->get();
    }
}
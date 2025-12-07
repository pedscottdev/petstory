<?php

namespace App\Services;

use App\Models\Pet;
use App\Models\PetLike;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PetService
{
    /**
     * Get pet by ID with owner information
     *
     * @param string $petId
     * @return Pet|null
     */
    public function getPetWithOwner(string $petId)
    {
        return Pet::with('owner:id,first_name,last_name,avatar_url')->find($petId);
    }

    /**
     * Create a new pet
     *
     * @param string $ownerId
     * @param array $data
     * @return Pet
     */
    public function createPet(string $ownerId, array $data): Pet
    {
        $data['owner_id'] = $ownerId;
        
        // Set default avatar if not provided
        if (!isset($data['avatar_url'])) {
            $data['avatar_url'] = '/images/default-pet-avatar.jpg';
        }
        
        return Pet::create($data);
    }

    /**
     * Update pet information
     *
     * @param string $petId
     * @param array $data
     * @return Pet
     */
    public function updatePet(string $petId, array $data): Pet
    {
        $pet = Pet::findOrFail($petId);
        
        // Only update allowed fields
        $allowedFields = ['name', 'species', 'breed', 'gender', 'age', 'description', 'avatar_url'];
        $updateData = array_intersect_key($data, array_flip($allowedFields));
        
        $pet->update($updateData);
        
        return $pet;
    }

    /**
     * Delete a pet
     *
     * @param string $petId
     * @return bool
     */
    public function deletePet(string $petId): bool
    {
        $pet = Pet::findOrFail($petId);
        
        // Delete associated likes
        PetLike::where('pet_id', $petId)->delete();
        
        return $pet->delete();
    }

    /**
     * Get all pets for a user
     *
     * @param string $ownerId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserPets(string $ownerId)
    {
        return Pet::where('owner_id', $ownerId)->get();
    }

    /**
     * Toggle like status for a pet (like if not liked, unlike if already liked)
     *
     * @param string $userId
     * @param string $petId
     * @return array ['liked' => bool, 'action' => string]
     * @throws ValidationException if pet not found or user is pet owner
     */
    public function togglePetLike(string $userId, string $petId): array
    {
        // Check if pet exists - try finding by _id first, then by id
        $pet = Pet::find($petId);
        if (!$pet) {
            // Try finding by the id field if _id didn't work
            $pet = Pet::where('_id', $petId)->orWhere('id', $petId)->first();
        }
        if (!$pet) {
            throw ValidationException::withMessages([
                'pet' => ['Pet not found.'],
            ]);
        }
        
        // Prevent pet owner from liking their own pet
        if ((string) $pet->owner_id === $userId) {
            throw ValidationException::withMessages([
                'pet' => ['Bạn không thể thích thú cưng cửa chín mình'],
            ]);
        }
        
        // Use the actual pet ID from the model
        $actualPetId = $pet->_id ?? $pet->id;
        
        // Check if already liked
        $existingLike = PetLike::where('user_id', $userId)
            ->where('pet_id', $actualPetId)
            ->first();
            
        if ($existingLike) {
            // Unlike
            $existingLike->delete();
            return [
                'liked' => false,
                'action' => 'unliked'
            ];
        } else {
            // Like
            PetLike::create([
                'user_id' => $userId,
                'pet_id' => $actualPetId
            ]);
            
            // Create notification if user is not the pet owner
            if ($pet->owner_id !== $userId) {
                $notificationService = app(\App\Services\NotificationService::class);
                $notification = $notificationService->createNotification(
                    $pet->owner_id,
                    \App\Models\Notification::TYPE_LIKE_PET,
                    $userId,
                    ['pet_id' => $actualPetId, 'pet_name' => $pet->name]
                );
                event(new \App\Events\NotificationCreated($notification));
            }
            
            return [
                'liked' => true,
                'action' => 'liked'
            ];
        }
    }

    /**
     * Check if user has liked a pet
     *
     * @param string $userId
     * @param string $petId
     * @return bool
     */
    public function hasLikedPet(string $userId, string $petId): bool
    {
        return PetLike::where('user_id', $userId)
            ->where('pet_id', $petId)
            ->exists();
    }

    /**
     * Get like count for a pet
     *
     * @param string $petId
     * @return int
     */
    public function getPetLikeCount(string $petId): int
    {
        return PetLike::where('pet_id', $petId)->count();
    }

    /**
     * Get pets with pagination
     *
     * @param int $page
     * @param int $perPage
     * @param string|null $currentUserId
     * @return array
     */
    public function getPetsPaginated(int $page = 1, int $perPage = 15, ?string $currentUserId = null)
    {
        $pets = Pet::with('owner:id,first_name,last_name,avatar_url')
            ->get();
        
        if ($pets->isEmpty()) {
            return [];
        }

        // Get all pet IDs for batch query (handle both _id and id fields)
        $petIds = $pets->map(function ($pet) {
            return $pet->_id ?? $pet->id;
        })->toArray();
        
        // Batch fetch like counts for all pets
        $likeCounts = PetLike::whereIn('pet_id', $petIds)
            ->get()
            ->groupBy('pet_id')
            ->map(function ($likes) {
                return $likes->count();
            })
            ->toArray();
        
        // Batch fetch user's likes if user is logged in
        $userLikes = [];
        if ($currentUserId) {
            $userLikes = PetLike::whereIn('pet_id', $petIds)
                ->where('user_id', $currentUserId)
                ->pluck('pet_id')
                ->toArray();
        }
        
        // Transform pets to include like information
        return $pets->map(function ($pet) use ($likeCounts, $userLikes) {
            $petArray = $pet->toArray();
            $petId = $pet->_id ?? $pet->id;
            
            // Ensure _id is present in the response for frontend compatibility
            if (!isset($petArray['_id']) && isset($petId)) {
                $petArray['_id'] = $petId;
            }
            
            $petArray['like_count'] = $likeCounts[$petId] ?? 0;
            $petArray['is_liked'] = in_array($petId, $userLikes);
            return $petArray;
        })->all();
    }

    /**
     * Search pets by name or species
     *
     * @param string $query
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function searchPets(string $query, int $limit = 20)
    {
        return Pet::with('owner:id,first_name,last_name,avatar_url')
            ->where('name', 'like', '%' . $query . '%')
            ->orWhere('species', 'like', '%' . $query . '%')
            ->limit($limit)
            ->get();
    }
}
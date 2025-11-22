<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Pet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user first
        $adminUser = User::create([
            'first_name' => 'Administrator',
            'last_name' => 'System',
            'email' => 'admin@petstory.com',
            'password' => Hash::make('Goodday@123'),
            'avatar_url' => '/images/special-avatar.png',
            'bio' => 'Administrator of PetStory',
            'is_active' => true,
            'role' => 'admin',
        ]);

        // Create regular user
        $regularUser = User::create([
            'first_name' => 'Trọng',
            'last_name' => 'Phạm Hoàng',
            'email' => 'user@petstory.com',
            'password' => Hash::make('Goodday@123'),
            'avatar_url' => '/images/special-avatar.png',
            'bio' => 'I love my pets!',
            'is_active' => true,
            'role' => 'user',
        ]);

        $pets = [
            [
                'owner_id' => $regularUser->id,
                'name' => 'Buddy',
                'species' => 'Dog',
                'breed' => 'Golden Retriever',
                'gender' => 'male',
                'age' => 3,
                'description' => 'A friendly golden retriever who loves to play fetch.',
                'avatar_url' => 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop',
            ],
            [
                'owner_id' => $regularUser->id,
                'name' => 'Whiskers',
                'species' => 'Cat',
                'breed' => 'Persian',
                'gender' => 'female',
                'age' => 2,
                'description' => 'A calm and affectionate Persian cat who enjoys quiet spaces.',
                'avatar_url' => 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=400&fit=crop',
            ],
            [
                'owner_id' => $regularUser->id,
                'name' => 'Rocky',
                'species' => 'Dog',
                'breed' => 'German Shepherd',
                'gender' => 'male',
                'age' => 4,
                'description' => 'A loyal German Shepherd who is great with children.',
                'avatar_url' => 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&h=400&fit=crop',
            ],
        ];
        foreach ($pets as $petData) {
            Pet::create($petData);
        }
    }
}

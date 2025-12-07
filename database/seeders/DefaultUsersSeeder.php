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
            'bio' => 'Thế giới có thể ồn ào, nhưng về nhà ôm tụi nhỏ là thấy bình yên. 🐾❤️',
            'is_active' => true,
            'role' => 'user',
        ]);

        $pets = [
            [
                'owner_id' => $regularUser->id,
                'name' => 'Băng',
                'species' => 'dog',
                'breed' => 'Golden Retriever',
                'gender' => 'male',
                'age' => 3,
                'description' => 'Một chú chó Golden Retriever thân thiện, rất thích chơi ném bóng.',
                'avatar_url' => 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop',
            ],
            [
                'owner_id' => $regularUser->id,
                'name' => 'Miu Miu',
                'species' => 'cat',
                'breed' => 'Mèo Ba Tư',
                'gender' => 'female',
                'age' => 2,
                'description' => 'Một cô mèo Ba Tư hiền lành và tình cảm, thích những không gian yên tĩnh.',
                'avatar_url' => 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=400&fit=crop',
            ],
            [
                'owner_id' => $regularUser->id,
                'name' => 'Vàng',
                'species' => 'dog',
                'breed' => 'Chó chăn cừu Đức',
                'gender' => 'male',
                'age' => 4,
                'description' => 'Một chú chó chăn cừu Đức trung thành và rất thân thiện với trẻ em.',
                'avatar_url' => 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&h=400&fit=crop',
            ],
        ];

        foreach ($pets as $petData) {
            Pet::create($petData);
        }
    }
}

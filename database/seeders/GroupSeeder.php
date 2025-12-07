<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Seeder;

class GroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the admin user as the creator of all groups
        $adminUser = User::where('email', 'admin@petstory.com')->first();

        if (!$adminUser) {
            $this->command->error('Admin user not found. Please run DefaultUsersSeeder first.');
            return;
        }

        $groups = [
            // Dog groups
            [
                'creator_id' => $adminUser->id,
                'name' => 'Chó ta - Chó cỏ Việt Nam',
                'category' => 'dog',
                'description' => 'Bảo tồn và phát triển chó ta Việt Nam. Chia sẻ kinh nghiệm nuôi dưỡng, chăm sóc sức khỏe và giáo dục chó ta.',
                'avatarUrl' => 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop',
            ],
            [
                'creator_id' => $adminUser->id,
                'name' => 'Chó Husky - Chó sled thông minh',
                'category' => 'dog',
                'description' => 'Cộng đồng yêu thích chó Husky Siberia. Trao đổi về đặc điểm, huấn luyện, và chăm sóc giống chó năng động này.',
                'avatarUrl' => 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&h=400&fit=crop',
            ],
            [
                'creator_id' => $adminUser->id,
                'name' => 'Chó Corgi - Nhỏ nhưng tuyệt vời',
                'category' => 'dog',
                'description' => 'Nhóm dành cho những người yêu thích chó Corgi. Chia sẻ những khoảnh khắc vui vẻ, mẹo chăm sóc và nuôi dưỡng.',
                'avatarUrl' => 'https://images.unsplash.com/photo-1587300411515-430ee3e80afe?w=400&h=400&fit=crop',
            ],
            // Cat groups
            [
                'creator_id' => $adminUser->id,
                'name' => 'Mèo Anh lông dài - Quý tộc nhí',
                'category' => 'cat',
                'description' => 'Cộng đồng các tình yêu mèo Anh lông dài. Chia sẻ kinh nghiệm chăm sóc lông, dinh dưỡng và huấn luyện mèo cá tính này.',
                'avatarUrl' => 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=400&fit=crop',
            ],
            [
                'creator_id' => $adminUser->id,
                'name' => 'Mèo Ba Tư - Yêu thương và dịu dàng',
                'category' => 'cat',
                'description' => 'Nhóm dành cho những người yêu thích mèo Ba Tư với đôi mắt to tròn. Trao đổi về chăm sóc lông và tính cách nhẫn nại.',
                'avatarUrl' => 'https://images.unsplash.com/photo-1606214174585-fe31582dc1d8?w=400&h=400&fit=crop',
            ],
            [
                'creator_id' => $adminUser->id,
                'name' => 'Mèo Siamese - Cong thương và nhanh nhẹn',
                'category' => 'cat',
                'description' => 'Tập hợp những người yêu mèo Siamese đẹp mắt với giọng nói đặc biệt. Chia sẻ về tính cách, huấn luyện và nuôi dưỡng.',
                'avatarUrl' => 'https://images.unsplash.com/photo-1513360371669-4a0eb3a8d816?w=400&h=400&fit=crop',
            ],
            // Bird groups
            [
                'creator_id' => $adminUser->id,
                'name' => 'Chim anh vũ - Vẻ đẹp thiên nhiên',
                'category' => 'bird',
                'description' => 'Cộng đồng những người nuôi và yêu thích chim anh vũ. Trao đổi về chế độ ăn, môi trường sống và tập huấn chim.',
                'avatarUrl' => 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop',
            ],
            [
                'creator_id' => $adminUser->id,
                'name' => 'Chim cảnh - Thu hút thiên nhiên vào nhà',
                'category' => 'bird',
                'description' => 'Nhóm dành cho các nhà nuôi chim cảnh. Chia sẻ kinh nghiệm chọn chim, xây dựng chuồng trại và chăm sóc.',
                'avatarUrl' => 'https://images.unsplash.com/photo-1535241749838-299277b6305f?w=400&h=400&fit=crop',
            ],
            [
                'creator_id' => $adminUser->id,
                'name' => 'Chim vẹt - Thông minh và vui vẻ',
                'category' => 'bird',
                'description' => 'Cộng đồng những người yêu thích chim vẹt thông minh. Trao đổi về huấn luyện, giao tiếp và chăm sóc sức khỏe chim vẹt.',
                'avatarUrl' => 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=400&fit=crop',
            ],
            // All pets groups
            [
                'creator_id' => $adminUser->id,
                'name' => 'Thú cưng yêu quý - Cộng đồng tất cả thú cưng',
                'category' => 'all',
                'description' => 'Cộng đồng mở cho tất cả các loài thú cưng. Chia sẻ câu chuyện, kinh nghiệm chăm sóc và tình yêu với các thú cưng.',
                'avatarUrl' => 'https://images.unsplash.com/photo-1546527868-ccb7ee566dba?w=400&h=400&fit=crop',
            ],
            [
                'creator_id' => $adminUser->id,
                'name' => 'Sức khỏe thú cưng - Khám phá và phòng ngừa',
                'category' => 'all',
                'description' => 'Nhóm tập trung vào sức khỏe và wellness cho tất cả các loài thú cưng. Trao đổi về dinh dưỡng, tiêm chủng và chăm sóc y tế.',
                'avatarUrl' => 'https://images.unsplash.com/photo-1569163139394-de4798aa62b3?w=400&h=400&fit=crop',
            ],
            [
                'creator_id' => $adminUser->id,
                'name' => 'Những khoảnh khắc thú cưng - Chia sẻ niềm vui',
                'category' => 'all',
                'description' => 'Nơi chia sẻ những bức ảnh, video và khoảnh khắc đáng yêu, hài hước với các thú cưng của bạn.',
                'avatarUrl' => 'https://images.unsplash.com/photo-1491037639943-eac150de6d48?w=400&h=400&fit=crop',
            ],
        ];

        foreach ($groups as $groupData) {
            Group::create($groupData);
        }

        $this->command->info('12 groups have been successfully created!');
    }
}

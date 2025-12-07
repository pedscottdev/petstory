<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Pet;
use App\Models\Post;
use App\Models\Comment;
use App\Models\PostPet;
use App\Models\PostMultimedia;
use App\Models\PostLike;
use App\Models\Group;
use App\Models\GroupMember;

class SocialSampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Bắt đầu tạo dữ liệu mẫu...');

        // Bước 1: Tạo 30 người dùng mới
        $this->command->info('\n📝 Tạo 30 người dùng mới...');
        $newUsers = User::factory(30)->create();
        $this->command->info('✅ Đã tạo 30 người dùng mới!');

        // Bước 2: Tạo 1-3 thú cưng cho mỗi người dùng mới
        $this->command->info('\n🐾 Tạo thú cưng cho mỗi người dùng (1-3 thú cưng)...');
        $allNewPets = collect();
        foreach ($newUsers as $user) {
            $numberOfPets = rand(1, 3);
            $pets = Pet::factory($numberOfPets)->create([
                'owner_id' => $user->_id,
            ]);
            $allNewPets = $allNewPets->merge($pets);
        }
        $this->command->info('✅ Đã tạo ' . $allNewPets->count() . ' thú cưng!');

        // Lấy tất cả users và pets (bao gồm cả default users và new users)
        $allUsers = User::all();
        $allPets = Pet::all();

        if ($allUsers->count() < 6) {
            $this->command->error('Cần ít nhất 6 users để tạo nhóm! Vui lòng chạy DefaultUsersSeeder trước.');
            return;
        }

        // Bước 3: Tạo 12 nhóm, mỗi nhóm có ít nhất 6 thành viên
        $this->command->info('\n👥 Tạo 12 nhóm với ít nhất 6 thành viên mỗi nhóm...');
        $allGroups = Group::all();
        
        if ($allGroups->count() < 12) {
            $this->command->error('Cần có 12 nhóm! Vui lòng chạy GroupSeeder trước.');
            return;
        }

        // Thêm thành viên vào từng nhóm
        foreach ($allGroups as $group) {
            $numberOfMembers = rand(6, min(15, $allUsers->count()));
            $members = $allUsers->random($numberOfMembers);
            
            foreach ($members as $member) {
                // Kiểm tra xem user đã là thành viên chưa
                $exists = GroupMember::where('group_id', $group->_id)
                    ->where('user_id', $member->_id)
                    ->exists();
                
                if (!$exists) {
                    GroupMember::create([
                        'group_id' => $group->_id,
                        'user_id' => $member->_id,
                    ]);
                }
            }
        }
        $this->command->info('✅ Đã thêm thành viên vào 12 nhóm!');

        // Bước 4: Tạo 60 bài viết
        $this->command->info('\n📱 Tạo 60 bài viết với ít nhất 1 thú cưng, 1 ảnh, 1-30 lượt thích và 3+ bình luận...');

        for ($i = 1; $i <= 60; $i++) {
            // Chọn random author
            $author = $allUsers->random();
            
            // Lấy pets của author này
            $authorPets = $allPets->where('owner_id', $author->_id)->values();

            // Nếu author không có pet, bỏ qua
            if ($authorPets->isEmpty()) {
                $i--;
                continue;
            }

            // Tạo post
            $post = Post::create([
                'author_id' => $author->_id,
                'group_id' => $allGroups->random()->_id, // Random assign to a group
                'content' => $this->getRandomPetContent(),
                'is_active' => true,
            ]);

            // Tag ít nhất 1 pet của author
            $numberOfPetsToTag = rand(1, min(3, $authorPets->count()));
            $petsToTag = $authorPets->random($numberOfPetsToTag);

            foreach ($petsToTag as $pet) {
                PostPet::create([
                    'post_id' => $post->_id,
                    'pet_id' => $pet->_id,
                ]);
            }

            // Thêm ít nhất 1 ảnh (1-3 ảnh)
            $numberOfImages = rand(1, 3);
            for ($j = 0; $j < $numberOfImages; $j++) {
                PostMultimedia::create([
                    'post_id' => $post->_id,
                    'type' => 'image',
                    'file_url' => $this->getRandomPetImage(),
                ]);
            }

            // Thêm 1-30 lượt thích
            $numberOfLikes = rand(1, 30);
            $likers = $allUsers->random(min($numberOfLikes, $allUsers->count()));
            
            foreach ($likers as $liker) {
                PostLike::create([
                    'user_id' => $liker->_id,
                    'post_id' => $post->_id,
                ]);
            }

            // Thêm ít nhất 3 bình luận (3-8 comments)
            $numberOfComments = rand(3, 8);
            for ($k = 0; $k < $numberOfComments; $k++) {
                $commentAuthor = $allUsers->random();
                
                Comment::create([
                    'post_id' => $post->_id,
                    'author_id' => $commentAuthor->_id,
                    'parent_id' => null,
                    'content' => $this->getRandomComment(),
                ]);
            }

            if ($i % 10 == 0) {
                $this->command->info("Đã tạo {$i}/60 bài viết...");
            }
        }

        $this->command->info('\n✅ Hoàn thành! Đã tạo đầy đủ dữ liệu mẫu:');
        $this->command->info('   - 30 người dùng mới');
        $this->command->info('   - ' . $allNewPets->count() . ' thú cưng (1-3 con/người)');
        $this->command->info('   - 12 nhóm với ít nhất 6 thành viên');
        $this->command->info('   - 60 bài viết với thú cưng, ảnh, lượt thích và bình luận');
    }

    /**
     * Get random Vietnamese pet-related content
     */
    private function getRandomPetContent(): string
    {
        $contents = [
            // Nội dung chó
            'Hôm nay cún nhà mình lại làm trò nghịch ngợm, cắn rách giày của bố 😂 Ai nuôi chó cũng hiểu nỗi khổ này!',
            'Mỗi buổi sáng đều được boss đánh thức bằng cách liếm mặt 🐕 Yêu quá đi thôi!',
            'Rửa tắm cho cún xong là kiệt sức luôn 😅 Nhưng thấy nó thơm tho sạch sẽ lại vui lắm!',
            'Cún nhà mình học được lệnh "bắt tay" rồi nè! Ai cũng phải khen giỏi 🐾',
            'Đưa boss đi spa, giờ về thơm phức cả nhà 😍 Cún đẹp trai quá!',
            'Hôm nay dẫn cún đi công viên, chạy nhảy cả buổi mệt lả người 🏃',
            'Tối nào cũng phải dắt cún đi dạo, thói quen không thể thiếu được 🌙',
            'Cún nhà mình không chịu ăn cơm, chỉ thích ăn thịt bò thôi 😑 Quý tộc quá!',
            'Mua đồ chơi mới cho boss, vui lắm nè mọi người! 🎾',
            'Hôm nay cún tự nhiên buồn, không chơi không ăn. Lo quá các bạn ơi!',
            
            // Nội dung mèo
            'Mèo nhà mình ngủ cả ngày, chỉ thức dậy lúc đói và muốn chơi 😹',
            'Boss mèo vừa cào rách sofa mới mua 😭 Ai nuôi mèo cũng hiểu!',
            'Mỗi lần về nhà boss đều nhìn mình với ánh mắt khinh thường 😂 Làm như mình phải phục vụ boss ấy!',
            'Mèo nhà mình leo lên tủ lạnh ngủ, không biết nó thấy thoải mái sao nữa 🐱',
            'Hôm nay mua cá tươi về nấu cơm cho boss, ăn hết sạch trong 5 phút! 🐟',
            'Tắm cho mèo xong bị cào tay đầy vết 😅 Nhưng yêu nên chịu thôi!',
            'Boss mèo đang săn bướm ngoài vườn, dễ thương quá đi mất! 🦋',
            'Mèo nhà mình giấu đồ chơi khắp nơi, tìm mãi mới ra 😂',
            'Mỗi tối boss đều nhảy lên giường ngủ với mình, ấm áp lắm! 💤',
            'Hôm nay mèo tự nhiên âu yếm, lại gần xoa xoa. Chắc có việc muốn xin! 😸',
            
            // Nội dung chim
            'Chim nhà mình hót từ sáng đến chiều, tiếng rất hay! 🐦',
            'Boss chim học nói được tên mình rồi nè! Giỏi quá đi thôi! 🎤',
            'Hôm nay dọn lồng cho chim, sạch sẽ thơm tho cả căn phòng 🏠',
            'Cho boss tắm nắng buổi sáng, lông vũ sáng bóng lên hẳn! ☀️',
            'Chim nhà mình thích ăn rau muống lắm, ăn hết cả bó! 🥬',
            
            // Nội dung chung
            'Thú cưng là niềm vui mỗi ngày của mình, không thể thiếu được! ❤️',
            'Hôm nay boss ốm, phải đưa đi bác sĩ thú y. Lo lắm các bạn ơi! 💊',
            'Đi làm về là được boss đón ở cửa, mệt mỏi tan biến ngay! 🏡',
            'Mọi người có mẹo gì để chăm sóc thú cưng khỏe mạnh không? Share với mình nhé! 💕',
            'Boss nhà mình đang học trick mới, hy vọng sớm thành công! 🎯',
            'Hôm nay mua đồ ăn cho boss về đầy túi! Chuẩn bị ăn ngon cả tuần! 🛒',
            'Nuôi thú cưng vất vả nhưng hạnh phúc gấp nhiều lần! 🥰',
            'Ai cũng bảo boss nhà mình đẹp trai/xinh gái quá! Tự hào lắm! 😎',
            'Hôm nay boss làm điều siêu dễ thương, quay video lại được luôn! 📹',
            'Thật sự không biết cuộc sống thiếu boss sẽ ra sao nữa! 💝',
            'Boss nhà mình siêu thông minh, học mọi thứ nhanh lắm! 🧠',
            'Cuối tuần rảnh rỗi là dẫn boss đi chơi thôi! 🌳',
            'Nhìn boss ngủ mà yêu quá, chụp hình liên tục! 📸',
            'Ai nuôi thú cưng là hiểu được tình yêu vô điều kiện! 💗',
            'Boss nhà mình rất biết quan tâm người, cảm động quá! 😢',
        ];

        return $contents[array_rand($contents)];
    }

    /**
     * Get random Vietnamese comment
     */
    private function getRandomComment(): string
    {
        $comments = [
            // Comments ngắn - biểu cảm
            'Dễ thương quá! 😍',
            'Cute ghê! ❤️',
            'Yêu quá đi thôi! 🥰',
            'Đáng yêu quá! 💕',
            'Xinh/đẹp trai quá! 😊',
            'Giống boss nhà mình! 😂',
            'Thương quá chừng! 💖',
            'Nhìn mà muốn bế! 🤗',
            'Quá dễ thương luôn! 🥺',
            'Mlem mlem! 😋',
            
            // Comments chia sẻ kinh nghiệm
            'Mình cũng từng gặp tình huống này nè! Bạn nên thử...',
            'Bạn nên cho ăn thức ăn chuyên dụng, tốt hơn là tự nấu!',
            'Mình khuyên bạn nên đưa đi bác sĩ thú y kiểm tra nhé!',
            'Tip hay: cho boss tắm 1 tuần 2 lần là đủ rồi!',
            'Mình thấy boss bạn cần uống thêm vitamin đấy!',
            'Bạn thử mua đồ chơi loại này xem, boss mình rất thích!',
            'Nên cho boss đi tiêm phòng định kỳ nhé bạn!',
            'Chăm sóc rất tốt! Boss khỏe mạnh lắm!',
            'Mình cũng nuôi loài này, bạn cần advice không?',
            'Bạn cho ăn gì mà boss mập thế? Share mình với!',
            
            // Comments hỏi han
            'Boss bao nhiêu tuổi rồi bạn?',
            'Bạn nuôi được bao lâu rồi?',
            'Giống gì vậy bạn? Nhìn đẹp quá!',
            'Bạn mua ở đâu vậy? Cho mình xin info với!',
            'Boss bạn ăn gì mà khỏe thế?',
            'Bạn có gặp khó khăn gì khi nuôi không?',
            'Boss tính tình thế nào? Ngoan không?',
            'Có tốn kém không bạn?',
            'Bạn cho boss tắm ở đâu?',
            'Có phải boss bạn rất thông minh không?',
            
            // Comments khen ngợi
            'Bạn chăm sóc boss rất tốt! Học hỏi bạn nhiều!',
            'Nhìn boss khỏe mạnh thế là biết chủ chăm quá!',
            'Boss may mắn có chủ tốt như bạn!',
            'Bạn rất có tâm! Cố gắng nhé!',
            'Gia đình hạnh phúc quá! Chúc bạn và boss luôn vui vẻ!',
            'Tình yêu thương boss rõ ràng lắm! Thấy ấm lòng!',
            
            // Comments hài hước
            'Haha boss này bá đạo thật! 😂',
            'Chắc boss đang nghĩ: "Đừng chụp nữa!" 🤣',
            'Biểu cảm này cả ngày ôm bụng cười luôn! 😆',
            'Boss này chắc là ông hoàng/nữ hoàng nhà bạn rồi! 👑',
            'Nhìn kiểu này chắc boss đang giận chủ! 😅',
            'Mặt boss này nói lên tất cả! 😏',
            
            // Comments đồng cảm
            'Mình hiểu cảm giác này! Boss mình cũng vậy!',
            'Ối giời, mình cũng bị boss làm thế này!',
            'Nuôi boss nào cũng vất vả thế này cả! Cố lên!',
            'Haha cảm giác mỗi ngày của người nuôi thú cưng!',
            'Khóc cười với boss là chuyện thường ngày! 😭😂',
            'Đúng là thiên đường nhà boss, mình chỉ là người phục vụ!',
        ];

        return $comments[array_rand($comments)];
    }

    /**
     * Get random pet image URL
     */
    private function getRandomPetImage(): string
    {
        $categories = ['dog', 'cat', 'bird'];
        $category = $categories[array_rand($categories)];
        $seed = $category . '-' . rand(1, 100);
        
        return "https://picsum.photos/seed/{$seed}/800/600";
    }
}

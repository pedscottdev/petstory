<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Group;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $petContents = [
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
        ];

        return [
            'author_id' => User::factory(),
            'group_id' => fake()->optional(0.2)->passthrough(Group::inRandomOrder()->first()?->_id),
            'content' => fake()->randomElement($petContents),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the post is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the post belongs to a specific group.
     */
    public function forGroup($groupId): static
    {
        return $this->state(fn(array $attributes) => [
            'group_id' => $groupId,
        ]);
    }

    /**
     * Indicate that the post is by a specific author.
     */
    public function byAuthor($authorId): static
    {
        return $this->state(fn(array $attributes) => [
            'author_id' => $authorId,
        ]);
    }
}

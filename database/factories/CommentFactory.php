<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $petComments = [
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

        return [
            'post_id' => Post::factory(),
            'author_id' => User::factory(),
            'parent_id' => null,
            'content' => fake()->randomElement($petComments),
        ];
    }

    /**
     * Indicate that the comment is a reply to another comment.
     */
    public function reply($parentId): static
    {
        return $this->state(fn(array $attributes) => [
            'parent_id' => $parentId,
        ]);
    }

    /**
     * Indicate that the comment belongs to a specific post.
     */
    public function forPost($postId): static
    {
        return $this->state(fn(array $attributes) => [
            'post_id' => $postId,
        ]);
    }

    /**
     * Indicate that the comment is by a specific author.
     */
    public function byAuthor($authorId): static
    {
        return $this->state(fn(array $attributes) => [
            'author_id' => $authorId,
        ]);
    }
}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $first = fake()->firstName();     
        $last  = fake()->lastName();    

        // Bỏ dấu toàn bộ
        $firstSlug = strtolower($this->removeAccents($first));
        $lastSlug  = strtolower($this->removeAccents($last));

        // Tạo email
        $email = $lastSlug . "." . $firstSlug . "@petstory.com";

        // Bio tiếng Việt
        $bioVietnamese = fake('vi_VN')->realTextBetween(30, 80);

        // Generate unique avatar using Lorem Picsum
        $avatarSeed = 'user-' . rand(1, 1000);
        
        return [
            'first_name' => $first,
            'last_name' => $last,
            'email' => $email,
            'password' => static::$password ??= Hash::make('password'),
            'avatar_url' => "https://picsum.photos/seed/{$avatarSeed}/400/400",
            'bio' => $bioVietnamese,
            'is_active' => true,
            'role' => 'user',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user is an admin.
     */
    public function admin(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'admin',
        ]);
    }

    /**
     * Indicate that the user is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => false,
        ]);
    }

    private function removeAccents($str)
    {
        $accents = [
            'a' => 'á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ',
            'd' => 'đ',
            'e' => 'é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ',
            'i' => 'í|ì|ỉ|ĩ|ị',
            'o' => 'ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ',
            'u' => 'ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự',
            'y' => 'ý|ỳ|ỷ|ỹ|ỵ'
        ];

        foreach ($accents as $nonAccent => $accentRegex) {
            $str = preg_replace("/$accentRegex/u", $nonAccent, $str);
        }

        return $str;
    }
}

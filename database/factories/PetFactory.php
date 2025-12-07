<?php
namespace Database\Factories;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Pet>
 */
class PetFactory extends Factory
{
    public function definition(): array
    {
        $species = fake()->randomElement(['dog', 'cat', 'bird']);
        $breeds = [
            'dog' => [
                'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Bulldog', 'Pug',
                'Beagle', 'Husky', 'Shiba Inu', 'Poodle', 'Corgi', 'Border Collie',
                'Chihuahua', 'Rottweiler', 'Doberman'
            ],
            'cat' => [
                'Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Scottish Fold',
                'Ragdoll', 'Sphynx', 'American Shorthair', 'Bengal', 'Birman', 'Russian Blue'
            ],
            'bird' => [
                'Parrot', 'Cockatiel', 'Budgie', 'Finch', 'Canary', 'Lovebird',
                'African Grey', 'Macaw', 'Cockatoo'
            ],
        ];
        // Sử dụng Lorem Picsum với seed để có ảnh đa dạng
        $getRandomImage = function($category, $index) {
            $seed = $category . '-' . $index;
            return "https://picsum.photos/seed/{$seed}/400/400";
        };
        /** Ảnh minh họa theo loài */
        $speciesImages = [
            'dog' => array_map(fn($i) => $getRandomImage('dog', $i), range(1, 15)),
            'cat' => array_map(fn($i) => $getRandomImage('cat', $i), range(1, 15)),
            'bird' => array_map(fn($i) => $getRandomImage('bird', $i), range(1, 15)),
        ];
        return [
            'owner_id' => User::factory(),
            'name' => fake()->firstName(),
            'species' => $species,
            'breed' => fake()->randomElement($breeds[$species]),
            'gender' => fake()->randomElement(['male', 'female']),
            'age' => fake()->numberBetween(0, 20),
            'description' => fake()->optional()->sentence(12),
            'avatar_url' => fake()->randomElement($speciesImages[$species]),
        ];
    }
    
    public function dog(): static
    {
        return $this->state(fn () => [
            'species' => 'dog',
            'breed' => fake()->randomElement([
                'Golden Retriever', 'Labrador Retriever', 'Beagle', 'Poodle', 'Husky'
            ]),
        ]);
    }
    
    public function cat(): static
    {
        return $this->state(fn () => [
            'species' => 'cat',
            'breed' => fake()->randomElement([
                'Persian', 'Siamese', 'Ragdoll', 'British Shorthair'
            ]),
        ]);
    }
    
    public function bird(): static
    {
        return $this->state(fn () => [
            'species' => 'bird',
            'breed' => fake()->randomElement([
                'Parrot', 'Budgie', 'Canary', 'Cockatiel'
            ]),
        ]);
    }
}
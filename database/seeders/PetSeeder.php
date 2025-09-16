<?php

namespace Database\Seeders;

use App\Models\Pet;
use Illuminate\Database\Seeder;

class PetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pets = [
            [
                'name' => 'Buddy',
                'species' => 'Dog',
                'breed' => 'Golden Retriever',
                'age' => 36, // 3 years in months
                'gender' => 'male',
                'color' => 'Golden',
                'weight' => 28.5,
                'height' => 60.0,
                'description' => 'Friendly and energetic dog, loves to play fetch.',
                'owner_name' => 'John Smith',
                'owner_phone' => '+1234567890',
                'owner_email' => 'john.smith@email.com',
                'vaccination_status' => true,
                'medical_history' => [
                    'Vaccinated on 2023-06-15',
                    'Regular checkup on 2024-01-10'
                ],
                'status' => 'active',
                'image_url' => 'https://example.com/buddy.jpg',
                'microchip_id' => 'MC001234567',
                'registration_date' => now()->subMonths(6),
                'last_checkup' => now()->subMonths(2),
                'next_appointment' => now()->addMonths(4),
            ],
            [
                'name' => 'Whiskers',
                'species' => 'Cat',
                'breed' => 'Persian',
                'age' => 24, // 2 years in months
                'gender' => 'female',
                'color' => 'White',
                'weight' => 4.2,
                'height' => 25.0,
                'description' => 'Calm and affectionate cat, enjoys quiet spaces.',
                'owner_name' => 'Jane Doe',
                'owner_phone' => '+1234567891',
                'owner_email' => 'jane.doe@email.com',
                'vaccination_status' => false,
                'medical_history' => [
                    'Spayed on 2023-08-20'
                ],
                'status' => 'active',
                'image_url' => 'https://example.com/whiskers.jpg',
                'microchip_id' => 'MC001234568',
                'registration_date' => now()->subMonths(4),
                'last_checkup' => now()->subMonths(8),
                'next_appointment' => now()->addWeeks(2),
            ],
            [
                'name' => 'Rocky',
                'species' => 'Dog',
                'breed' => 'German Shepherd',
                'age' => 48, // 4 years in months
                'gender' => 'male',
                'color' => 'Black and Tan',
                'weight' => 35.0,
                'height' => 65.0,
                'description' => 'Loyal and protective dog, great with children.',
                'owner_name' => 'Mike Johnson',
                'owner_phone' => '+1234567892',
                'owner_email' => 'mike.johnson@email.com',
                'vaccination_status' => true,
                'medical_history' => [
                    'Vaccinated on 2023-09-12',
                    'Hip checkup on 2024-02-05'
                ],
                'status' => 'active',
                'image_url' => 'https://example.com/rocky.jpg',
                'microchip_id' => 'MC001234569',
                'registration_date' => now()->subMonths(8),
                'last_checkup' => now()->subMonths(1),
                'next_appointment' => now()->addMonths(5),
            ],
            [
                'name' => 'Bella',
                'species' => 'Rabbit',
                'breed' => 'Holland Lop',
                'age' => 18, // 1.5 years in months
                'gender' => 'female',
                'color' => 'Brown',
                'weight' => 1.8,
                'height' => 15.0,
                'description' => 'Gentle rabbit, loves carrots and hay.',
                'owner_name' => 'Sarah Wilson',
                'owner_phone' => '+1234567893',
                'owner_email' => 'sarah.wilson@email.com',
                'vaccination_status' => false,
                'medical_history' => [],
                'status' => 'active',
                'image_url' => 'https://example.com/bella.jpg',
                'microchip_id' => 'MC001234570',
                'registration_date' => now()->subMonths(3),
                'last_checkup' => now()->subMonths(10),
                'next_appointment' => now()->addDays(10),
            ],
            [
                'name' => 'Max',
                'species' => 'Bird',
                'breed' => 'Cockatiel',
                'age' => 60, // 5 years in months
                'gender' => 'male',
                'color' => 'Yellow and Gray',
                'weight' => 0.1,
                'height' => 32.0,
                'description' => 'Talkative bird, knows several phrases.',
                'owner_name' => 'Tom Brown',
                'owner_phone' => '+1234567894',
                'owner_email' => 'tom.brown@email.com',
                'vaccination_status' => true,
                'medical_history' => [
                    'Wing clipping on 2024-01-15'
                ],
                'status' => 'active',
                'image_url' => 'https://example.com/max.jpg',
                'microchip_id' => 'MC001234571',
                'registration_date' => now()->subYears(2),
                'last_checkup' => now()->subMonths(3),
                'next_appointment' => now()->addMonths(3),
            ]
        ];

        foreach ($pets as $petData) {
            Pet::create($petData);
        }
    }
}
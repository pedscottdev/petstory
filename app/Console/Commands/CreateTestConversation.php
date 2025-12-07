<?php

namespace App\Console\Commands;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Console\Command;

class CreateTestConversation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:create-conversation';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create test conversations for debugging';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            // Get first two users
            $users = User::take(2)->get();

            if ($users->count() < 2) {
                $this->error('❌ Need at least 2 users in database!');
                return 1;
            }

            $user1 = $users->first();
            $user2 = $users->last();

            // Create 1-on-1 conversation
            $conversation = Conversation::create([
                'is_group' => false,
                'creator_id' => $user1->id,
                'name' => null,
                'description' => null,
            ]);

            // Attach users
            $conversation->users()->attach([$user1->id, $user2->id]);

            $this->info('✅ Test conversation created successfully!');
            $this->line("Conversation ID: {$conversation->id}");
            $this->line("Creator: {$user1->name} (ID: {$user1->id})");
            $this->line("Member: {$user2->name} (ID: {$user2->id})");
            $this->line("\n📝 Test this URL in Postman or browser:");
            $this->line("GET /api/conversations/{$conversation->id}");

            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Error: {$e->getMessage()}");
            return 1;
        }
    }
}

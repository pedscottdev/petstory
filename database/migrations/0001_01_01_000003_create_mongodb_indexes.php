<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create unique index for users.email
        DB::connection('mongodb')->getMongoDB()->selectCollection('users')->createIndex(
            ['email' => 1],
            ['unique' => true]
        );

        // Create unique index for post_likes (user_id, post_id)
        DB::connection('mongodb')->getMongoDB()->selectCollection('post_likes')->createIndex(
            ['user_id' => 1, 'post_id' => 1],
            ['unique' => true]
        );

        // Create unique index for pet_likes (user_id, pet_id)
        DB::connection('mongodb')->getMongoDB()->selectCollection('pet_likes')->createIndex(
            ['user_id' => 1, 'pet_id' => 1],
            ['unique' => true]
        );

        // Create unique index for group_members (group_id, user_id)
        DB::connection('mongodb')->getMongoDB()->selectCollection('group_members')->createIndex(
            ['group_id' => 1, 'user_id' => 1],
            ['unique' => true]
        );

        // Create unique index for follows (follower_id, following_id)
        DB::connection('mongodb')->getMongoDB()->selectCollection('follows')->createIndex(
            ['follower_id' => 1, 'following_id' => 1],
            ['unique' => true]
        );

        // Create TTL index for otp_verifications.expires_at
        DB::connection('mongodb')->getMongoDB()->selectCollection('otp_verifications')->createIndex(
            ['expires_at' => 1],
            ['expireAfterSeconds' => 0]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop unique index for users.email
        DB::connection('mongodb')->getMongoDB()->selectCollection('users')->dropIndex('email_1');

        // Drop unique index for post_likes (user_id, post_id)
        DB::connection('mongodb')->getMongoDB()->selectCollection('post_likes')->dropIndex('user_id_1_post_id_1');

        // Drop unique index for pet_likes (user_id, pet_id)
        DB::connection('mongodb')->getMongoDB()->selectCollection('pet_likes')->dropIndex('user_id_1_pet_id_1');

        // Drop unique index for group_members (group_id, user_id)
        DB::connection('mongodb')->getMongoDB()->selectCollection('group_members')->dropIndex('group_id_1_user_id_1');

        // Drop unique index for follows (follower_id, following_id)
        DB::connection('mongodb')->getMongoDB()->selectCollection('follows')->dropIndex('follower_id_1_following_id_1');

        // Drop TTL index for otp_verifications.expires_at
        DB::connection('mongodb')->getMongoDB()->selectCollection('otp_verifications')->dropIndex('expires_at_1');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create post_pets collection in MongoDB
        DB::connection('mongodb')->getMongoDB()->createCollection('post_pets');
        
        // Create indexes
        DB::connection('mongodb')->getMongoDB()->selectCollection('post_pets')->createIndex([
            'post_id' => 1,
            'pet_id' => 1
        ], [
            'unique' => true
        ]);
        
        DB::connection('mongodb')->getMongoDB()->selectCollection('post_pets')->createIndex([
            'post_id' => 1
        ]);
        
        DB::connection('mongodb')->getMongoDB()->selectCollection('post_pets')->createIndex([
            'pet_id' => 1
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop post_pets collection
        DB::connection('mongodb')->getMongoDB()->dropCollection('post_pets');
    }
};
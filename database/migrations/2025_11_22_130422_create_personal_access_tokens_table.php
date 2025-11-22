<?php

use Illuminate\Database\Migrations\Migration;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For MongoDB, we don't need to create tables in the traditional sense
        // The collection will be created automatically when data is inserted
        // We just need to ensure the proper indexing
        
        // Create indexes for better performance
        DB::connection('mongodb')->getMongoDB()->selectCollection('personal_access_tokens')->createIndex([
            'token' => 1
        ], [
            'unique' => true
        ]);
        
        DB::connection('mongodb')->getMongoDB()->selectCollection('personal_access_tokens')->createIndex([
            'tokenable_type' => 1,
            'tokenable_id' => 1
        ]);
        
        DB::connection('mongodb')->getMongoDB()->selectCollection('personal_access_tokens')->createIndex([
            'expires_at' => 1
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the collection
        DB::connection('mongodb')->getMongoDB()->selectCollection('personal_access_tokens')->drop();
    }
};

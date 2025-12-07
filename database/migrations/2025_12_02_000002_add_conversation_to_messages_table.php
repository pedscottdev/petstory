<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds conversation_id to the messages collection to support conversation-based chat.
     */
    public function up(): void
    {
        // MongoDB doesn't require strict schema, but this migration documents the structure
        // Ensure messages collection has the conversation_id field
        Schema::connection('mongodb')->table('messages', function (Blueprint $table) {
            // MongoDB supports adding fields dynamically, this is for reference
            // In practice, you can just use the model with the fillable property
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

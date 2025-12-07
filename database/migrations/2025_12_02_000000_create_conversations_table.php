<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('mongodb')->create('conversations', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable(); // Nullable for direct messages
            $table->boolean('is_group')->default(false); // Group chat flag
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade'); // User who created the conversation
            $table->text('description')->nullable();
            $table->timestamps();

            // Index for faster queries
            $table->index('creator_id');
            $table->index('is_group');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('conversations');
    }
};

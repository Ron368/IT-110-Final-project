<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('reviewable'); // reviewable_id + reviewable_type
            $table->unsignedTinyInteger('rating'); // 1–5
            $table->text('body');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            // Prevent duplicate reviews
            $table->unique(['user_id', 'reviewable_id', 'reviewable_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};


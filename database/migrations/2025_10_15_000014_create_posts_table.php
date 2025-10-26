<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('author_id');
            $table->text('content')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->string('visibility', 20)->default('public');
            $table->unsignedBigInteger('reply_to_post_id')->nullable();

            $table->foreign('author_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('reply_to_post_id')->references('id')->on('posts')->onDelete('set null');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};



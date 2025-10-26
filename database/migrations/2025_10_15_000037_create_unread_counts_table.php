<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unread_counts', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id');
            $table->string('type', 30);
            $table->integer('count')->default(0);
            $table->timestamp('updated_at')->useCurrent();

            $table->primary(['user_id', 'type']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unread_counts');
    }
};



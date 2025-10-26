<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recommendations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->string('target_type', 20)->nullable();
            $table->unsignedBigInteger('target_id')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->text('reason')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('valid_until')->nullable();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendations');
    }
};



<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mindmap_nodes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('campaign_id');
            $table->string('title', 150)->nullable();
            $table->text('notes')->nullable();
            $table->decimal('pos_x', 10, 2)->nullable();
            $table->decimal('pos_y', 10, 2)->nullable();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('campaign_id')->references('id')->on('campaigns')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mindmap_nodes');
    }
};



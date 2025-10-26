<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mindmap_edges', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('campaign_id');
            $table->unsignedBigInteger('source_node_id');
            $table->unsignedBigInteger('target_node_id');
            $table->string('label', 100)->nullable();

            $table->foreign('campaign_id')->references('id')->on('campaigns')->onDelete('cascade');
            $table->foreign('source_node_id')->references('id')->on('mindmap_nodes')->onDelete('cascade');
            $table->foreign('target_node_id')->references('id')->on('mindmap_nodes')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mindmap_edges');
    }
};



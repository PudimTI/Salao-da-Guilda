<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mindmap_node_files', function (Blueprint $table) {
            $table->unsignedBigInteger('node_id');
            $table->unsignedBigInteger('file_id');

            $table->primary(['node_id', 'file_id']);
            $table->foreign('node_id')->references('id')->on('mindmap_nodes')->onDelete('cascade');
            $table->foreign('file_id')->references('id')->on('campaign_files')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mindmap_node_files');
    }
};



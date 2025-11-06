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
        Schema::table('messages', function (Blueprint $table) {
            $table->unsignedBigInteger('reply_to')->nullable()->after('media_url');
            $table->timestamp('edited_at')->nullable()->after('created_at');
            
            $table->foreign('reply_to')->references('id')->on('messages')->onDelete('set null');
            $table->index('reply_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['reply_to']);
            $table->dropIndex(['reply_to']);
            $table->dropColumn(['reply_to', 'edited_at']);
        });
    }
};

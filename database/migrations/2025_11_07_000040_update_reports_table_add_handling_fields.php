<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->unsignedBigInteger('handled_by')->nullable()->after('status');
            $table->timestampTz('handled_at')->nullable()->after('handled_by');
            $table->text('resolution_notes')->nullable()->after('handled_at');

            $table->index(['target_type', 'target_id'], 'reports_target_index');

            $table->foreign('handled_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['handled_by']);
            $table->dropIndex('reports_target_index');

            $table->dropColumn(['handled_by', 'handled_at', 'resolution_notes']);
        });
    }
};










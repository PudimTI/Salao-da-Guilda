<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('owner_id');
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->string('system', 100)->nullable();
            $table->string('type', 20)->nullable();
            $table->string('city', 100)->nullable();
            $table->text('rules')->nullable();
            $table->string('status', 20)->default('open');
            $table->string('visibility', 20)->default('public');
            $table->timestamps();

            $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');

            $table->index('system');
            $table->index('type');
            $table->index('city');
        });

        // Add CHECK constraint for type ('digital'|'presencial')
        DB::statement("ALTER TABLE campaigns ADD CONSTRAINT campaigns_type_check CHECK (type IS NULL OR type IN ('digital','presencial'))");
    }

    public function down(): void
    {
        // Drop check constraint explicitly before dropping table (Postgres requirement for some setups)
        DB::statement("ALTER TABLE IF EXISTS campaigns DROP CONSTRAINT IF EXISTS campaigns_type_check");
        Schema::dropIfExists('campaigns');
    }
};



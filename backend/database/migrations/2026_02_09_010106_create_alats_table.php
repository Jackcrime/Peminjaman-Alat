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
        Schema::create('alats', function (Blueprint $table) {
            $table->id();
            $table->string('nama_alat')->nullable();
            $table->string('kode_alat')->unique();
            $table->integer('stok')->default(0);
            $table->text('deskripsi')->nullable();
            $table->enum('kondisi', [
                'baik',
                'rusak_ringan',
                'rusak_berat',
                'hancur'
            ])->nullable();
            $table->foreignId('kategori_id')->nullable()->constrained('kategoris')->cascadeOnDelete();
            $table->foreignId('lokasi_id')->nullable()->constrained('lokasis')->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alats');
    }
};

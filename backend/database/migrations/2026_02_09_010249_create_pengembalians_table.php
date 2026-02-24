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
        Schema::create('pengembalians', function (Blueprint $table) {
            $table->id();
            $table->date('tgl_pengembalian_aktual')->nullable();
            $table->integer('denda')->default(0);
            $table->enum('kondisi_yang_dikembalikan', [
                'baik', 'rusak_ringan', 'rusak_berat', 'hancur', 'hilang'
            ])->nullable();
            $table->string('catatan');
            $table->foreignId('peminjaman_id')->unique()->constrained('peminjamans')->cascadeOnDelete();
            $table->foreignId('kategori_id')->constrained('kategoris')->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengembalians');
    }
};

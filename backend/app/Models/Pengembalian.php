<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengembalian extends Model
{

protected $table = 'pengembalians';

    protected $fillable = [
        'tgl_pengembalian_aktual',
        'denda',
        'kondisi_yang_dikembalikan',
        'peminjaman_id',
        'kategori_id',
        'catatan',
    ];

    // FIX: peminjamans → peminjaman (singular)
    public function peminjaman()
    {
        return $this->belongsTo(Peminjaman::class, 'peminjaman_id', 'id');
    }

    // FIX: kategoris → kategori (singular)
    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }
}
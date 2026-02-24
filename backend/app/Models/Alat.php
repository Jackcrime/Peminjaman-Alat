<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Alat extends Model
{
    use HasFactory, SoftDeletes, Notifiable;

    protected $table = 'alats';
    
    protected $fillable = [
        'nama_alat',
        'kode_alat',
        'stok',
        'kategori_id',
        'lokasi_id',
        'kondisi',
        'deskripsi',
    ];

    // FIX: kategoris → kategori (singular)
    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }

    // FIX: lokasis → lokasi (singular)
    public function lokasi()
    {
        return $this->belongsTo(Lokasi::class);
    }

    // Plural OK untuk hasMany
    public function peminjamans()
    {
        return $this->hasMany(Peminjaman::class);
    }
}
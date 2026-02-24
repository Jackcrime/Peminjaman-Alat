<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Peminjaman extends Model
{
    use HasFactory, SoftDeletes, Notifiable;

    protected $table = 'peminjamans';

    protected $fillable = [
        'jumlah',
        'tgl_peminjaman',
        'tgl_pengembalian',
        'status',
        'catatan',
        'kategori_id',
        'alat_id',
        'user_id',
    ];

    // FIX: kategoris → kategori (singular)
    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }

    // FIX: alats → alat (singular)
    public function alat()
    {
        return $this->belongsTo(Alat::class);
    }

    // FIX: users → user (singular)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // FIX: pengembalians → pengembalian (singular untuk hasOne)
    public function pengembalian()
    {
        return $this->hasOne(Pengembalian::class);
    }
}
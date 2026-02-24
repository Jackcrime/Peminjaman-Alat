<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Lokasi extends Model
{
    use HasFactory, SoftDeletes, Notifiable;

    protected $table = 'lokasis';

    protected $fillable = [
        'nama_ruangan',
        'kode_ruangan',
        'deskripsi',
    ];

    public function alats()
    {
        return $this->hasMany(Alat::class);
    }
}

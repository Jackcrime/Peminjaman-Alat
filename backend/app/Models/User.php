<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ← TAMBAH ini

class User extends Authenticatable
{ 
    use HasFactory, SoftDeletes, Notifiable, HasApiTokens;
    
    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'kelas',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function peminjamans()
    {
        return $this->hasMany(Peminjaman::class);
    }

    public function logAktifitas()
    {
        return $this->hasMany(LogAktifitas::class);
    }
}
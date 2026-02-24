<?php

namespace App\Observers;

use App\Models\Kategori;
use App\Models\LogAktifitas;

class KategoriObserver
{
    public function created(Kategori $kategori)
    {
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Menambahkan kategori baru',
            'keterangan' => "Kategori '{$kategori->nama_kategori}' berhasil ditambahkan",
            'waktu' => now(),
        ]);
    }

    public function updated(Kategori $kategori)
    {
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Mengubah data kategori',
            'keterangan' => "Mengubah kategori '{$kategori->nama_kategori}'",
            'waktu' => now(),
        ]);
    }

    public function deleted(Kategori $kategori)
    {
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Menghapus kategori',
            'keterangan' => "Menghapus kategori '{$kategori->nama_kategori}'",
            'waktu' => now(),
        ]);
    }
}
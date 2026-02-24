<?php

namespace App\Observers;

use App\Models\Lokasi;
use App\Models\LogAktifitas;

class LokasiObserver
{
    public function created(Lokasi $lokasi)
    {
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Menambahkan lokasi baru',
            'keterangan' => "Lokasi '{$lokasi->nama_ruangan}' ({$lokasi->kode_ruangan}) berhasil ditambahkan",
            'waktu' => now(),
        ]);
    }

    public function updated(Lokasi $lokasi)
    {
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Mengubah data lokasi',
            'keterangan' => "Mengubah lokasi '{$lokasi->nama_ruangan}' ({$lokasi->kode_ruangan})",
            'waktu' => now(),
        ]);
    }

    public function deleted(Lokasi $lokasi)
    {
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Menghapus lokasi',
            'keterangan' => "Menghapus lokasi '{$lokasi->nama_ruangan}' ({$lokasi->kode_ruangan})",
            'waktu' => now(),
        ]);
    }
}
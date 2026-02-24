<?php

namespace App\Observers;

use App\Models\Alat;
use App\Models\LogAktifitas;

class AlatObserver
{
    public function created(Alat $alat)
    {
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Menambahkan alat baru',
            'keterangan' => "Alat '{$alat->nama_alat}' dengan kode {$alat->kode_alat} berhasil ditambahkan",
            'waktu' => now(),
        ]);
    }

    public function updated(Alat $alat)
    {
        // Cek field mana yang berubah
        $changes = [];
        if ($alat->isDirty('nama_alat')) {
            $changes[] = "nama: {$alat->getOriginal('nama_alat')} → {$alat->nama_alat}";
        }
        if ($alat->isDirty('stok')) {
            $changes[] = "stok: {$alat->getOriginal('stok')} → {$alat->stok}";
        }
        if ($alat->isDirty('kondisi')) {
            $changes[] = "kondisi: {$alat->getOriginal('kondisi')} → {$alat->kondisi}";
        }

        $keterangan = count($changes) > 0 
            ? "Mengubah alat '{$alat->nama_alat}' - " . implode(', ', $changes)
            : "Mengubah data alat '{$alat->nama_alat}'";

        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Mengubah data alat',
            'keterangan' => $keterangan,
            'waktu' => now(),
        ]);
    }

    public function deleted(Alat $alat)
    {
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Menghapus alat',
            'keterangan' => "Menghapus alat '{$alat->nama_alat}' dengan kode {$alat->kode_alat}",
            'waktu' => now(),
        ]);
    }
}
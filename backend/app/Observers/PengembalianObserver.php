<?php

namespace App\Observers;

use App\Models\Pengembalian;
use App\Models\LogAktifitas;

class PengembalianObserver
{
    public function created(Pengembalian $pengembalian)
    {
        $pengembalian->load(['peminjaman.user', 'peminjaman.alat']);
        
        $dendaInfo = $pengembalian->denda > 0 ? " dengan denda Rp " . number_format($pengembalian->denda, 0, ',', '.') : '';
        
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Memproses pengembalian',
            'keterangan' => "Pengembalian {$pengembalian->peminjaman->alat->nama_alat} oleh {$pengembalian->peminjaman->user->name} berhasil diproses{$dendaInfo}",
            'waktu' => now(),
        ]);
    }

    public function updated(Pengembalian $pengembalian)
    {
        $pengembalian->load(['peminjaman.user', 'peminjaman.alat']);
        
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Mengubah data pengembalian',
            'keterangan' => "Mengubah data pengembalian {$pengembalian->peminjaman->alat->nama_alat} oleh {$pengembalian->peminjaman->user->name}",
            'waktu' => now(),
        ]);
    }

    public function deleted(Pengembalian $pengembalian)
    {
        $pengembalian->load(['peminjaman.user', 'peminjaman.alat']);
        
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Menghapus data pengembalian',
            'keterangan' => "Menghapus data pengembalian {$pengembalian->peminjaman->alat->nama_alat} oleh {$pengembalian->peminjaman->user->name}",
            'waktu' => now(),
        ]);
    }
}
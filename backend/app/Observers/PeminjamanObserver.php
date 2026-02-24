<?php

namespace App\Observers;

use App\Models\Peminjaman;
use App\Models\LogAktifitas;

class PeminjamanObserver
{
    public function created(Peminjaman $peminjaman)
    {
        $peminjaman->load(['user', 'alat']);
        
        LogAktifitas::create([
            'user_id' => $peminjaman->user_id,
            'aktifitas' => 'Mengajukan peminjaman',
            'keterangan' => "User {$peminjaman->user->name} mengajukan peminjaman {$peminjaman->alat->nama_alat} sebanyak {$peminjaman->jumlah} unit",
            'waktu' => now(),
        ]);
    }

    public function updated(Peminjaman $peminjaman)
    {
        $peminjaman->load(['user', 'alat']);
        
        // Cek jika status berubah
        if ($peminjaman->isDirty('status')) {
            $oldStatus = $peminjaman->getOriginal('status');
            $newStatus = $peminjaman->status;
            
            $aktifitas = '';
            $keterangan = '';
            
            if ($newStatus === 'disetujui') {
                $aktifitas = 'Menyetujui peminjaman';
                $keterangan = "Peminjaman {$peminjaman->alat->nama_alat} oleh {$peminjaman->user->name} disetujui";
            } elseif ($newStatus === 'ditolak') {
                $aktifitas = 'Menolak peminjaman';
                $keterangan = "Peminjaman {$peminjaman->alat->nama_alat} oleh {$peminjaman->user->name} ditolak";
            } elseif ($newStatus === 'selesai') {
                $aktifitas = 'Menyelesaikan peminjaman';
                $keterangan = "Peminjaman {$peminjaman->alat->nama_alat} oleh {$peminjaman->user->name} telah selesai";
            }
            
            if ($aktifitas) {
                LogAktifitas::create([
                    'user_id' => auth()->id(),
                    'aktifitas' => $aktifitas,
                    'keterangan' => $keterangan,
                    'waktu' => now(),
                ]);
            }
        }
    }

    public function deleted(Peminjaman $peminjaman)
    {
        $peminjaman->load(['user', 'alat']);
        
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Menghapus peminjaman',
            'keterangan' => "Menghapus data peminjaman {$peminjaman->alat->nama_alat} oleh {$peminjaman->user->name}",
            'waktu' => now(),
        ]);
    }
}
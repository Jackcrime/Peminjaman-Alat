<?php

namespace App\Observers;

use App\Models\User;
use App\Models\LogAktifitas;

class UserObserver
{
    public function created(User $user)
    {
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Menambahkan user baru',
            'keterangan' => "User '{$user->name}' ({$user->email}) dengan role {$user->role} berhasil ditambahkan",
            'waktu' => now(),
        ]);
    }

    public function updated(User $user)
    {
        $changes = [];
        if ($user->isDirty('role')) {
            $changes[] = "role: {$user->getOriginal('role')} → {$user->role}";
        }
        
        $keterangan = count($changes) > 0
            ? "Mengubah user '{$user->name}' - " . implode(', ', $changes)
            : "Mengubah data user '{$user->name}'";

        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Mengubah data user',
            'keterangan' => $keterangan,
            'waktu' => now(),
        ]);
    }

    public function deleted(User $user)
    {
        LogAktifitas::create([
            'user_id' => auth()->id(),
            'aktifitas' => 'Menghapus user',
            'keterangan' => "Menghapus user '{$user->name}' ({$user->email})",
            'waktu' => now(),
        ]);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use App\Models\Peminjaman;
use App\Models\User;

class DashboardController extends Controller {
    public function index() {
        return response()->json([
            'total_alat' => Alat::count(),
            'total_peminjam' => User::where('role', 'user')->count(), // Fix: 'user' bukan 'peminjam'
            'pinjaman_aktif' => Peminjaman::where('status', 'disetujui')->count(), // Fix: 'status' bukan 'keterangan'
            'pending_approval' => Peminjaman::where('status', 'diajukan')->count(), // Fix: 'status' bukan 'keterangan'
        ]);
    }
}
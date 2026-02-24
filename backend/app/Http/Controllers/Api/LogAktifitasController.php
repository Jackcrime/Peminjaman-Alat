<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogAktifitas;
use Illuminate\Http\Request;

class LogAktifitasController extends Controller
{
    // Lihat semua log (diurutkan terbaru)
    public function index()
    {
        // Load user biar tau siapa yang melakukan aktivitas
        $logs = LogAktifitas::with('user')->latest()->get();
        return response()->json($logs);
    }

    // Detail Log (Jarang dipake, tapi disediakan aja)
    public function show($id)
    {
        return response()->json(LogAktifitas::with('user')->findOrFail($id));
    }

    // Hapus Log (Misal: Bersihkan log lama)
    public function destroy($id)
    {
        LogAktifitas::findOrFail($id)->delete();
        return response()->json(['message' => 'Log aktivitas berhasil dihapus']);
    }
   
}
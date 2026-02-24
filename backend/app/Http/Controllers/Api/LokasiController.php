<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lokasi;
use Illuminate\Http\Request;

class LokasiController extends Controller
{
    public function index()
    {
        // Tambah count alat per lokasi
        $lokasis = Lokasi::withCount('alats')->get();
        return response()->json($lokasis);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_ruangan' => 'required|string|max:255',
            'kode_ruangan' => 'required|string|max:50|unique:lokasis,kode_ruangan',
            'deskripsi'    => 'nullable|string'
        ]);

        $lokasi = Lokasi::create($validated);
        return response()->json([
            'message' => 'Lokasi berhasil ditambahkan', 
            'data' => $lokasi
        ], 201);
    }

    public function show($id)
    {
        // Load alat-alat yang ada di lokasi ini
        $lokasi = Lokasi::with('alats')->findOrFail($id);
        return response()->json($lokasi);
    }

    public function update(Request $request, $id)
    {
        $lokasi = Lokasi::findOrFail($id);

        $validated = $request->validate([
            'nama_ruangan' => 'required|string|max:255',
            'kode_ruangan' => 'required|string|max:50|unique:lokasis,kode_ruangan,' . $id,
            'deskripsi'    => 'nullable|string'
        ]);

        $lokasi->update($validated);
        return response()->json([
            'message' => 'Lokasi berhasil diperbarui', 
            'data' => $lokasi
        ]);
    }

    public function destroy($id)
    {
        $lokasi = Lokasi::findOrFail($id);
        
        // Cek apakah lokasi masih punya alat
        if ($lokasi->alats()->count() > 0) {
            return response()->json([
                'message' => 'Lokasi tidak bisa dihapus karena masih ada alat di lokasi ini'
            ], 400);
        }
        
        $lokasi->delete();
        return response()->json(['message' => 'Lokasi berhasil dihapus']);
    }
}
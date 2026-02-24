<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alat;
use Illuminate\Http\Request;

class AlatController extends Controller
{
    // Tampilkan semua alat + relasinya
    public function index()
    {
        // FIX: kategoris → kategori, lokasis → lokasi
        $alats = Alat::with(['kategori', 'lokasi'])->latest()->get();
        return response()->json($alats);
    }

    // Tambah Alat Baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_alat'   => 'required|string|max:255',
            'kode_alat'   => 'required|string|max:255|unique:alats,kode_alat',
            'stok'        => 'required|integer|min:0',
            'kategori_id' => 'required|exists:kategoris,id',
            'lokasi_id'   => 'required|exists:lokasis,id',
            'kondisi'     => 'required|in:baik,rusak_ringan,rusak_berat,hancur',
            'deskripsi'   => 'nullable|string',
        ]);

        $alat = Alat::create($validated);

        return response()->json([
            'message' => 'Alat berhasil ditambahkan',
            'data'    => $alat->load(['kategori', 'lokasi']) // Load relasi
        ], 201);
    }

    // Detail satu alat
    public function show($id)
    {
        // FIX: kategoris → kategori, lokasis → lokasi
        $alat = Alat::with(['kategori', 'lokasi'])->findOrFail($id);
        return response()->json($alat);
    }

    // Update Alat
    public function update(Request $request, $id)
    {
        $alat = Alat::findOrFail($id);

        $validated = $request->validate([
            'nama_alat'   => 'required|string|max:255',
            'kode_alat'   => 'required|string|max:255|unique:alats,kode_alat,' . $id,
            'stok'        => 'required|integer|min:0',
            'kategori_id' => 'required|exists:kategoris,id',
            'lokasi_id'   => 'required|exists:lokasis,id',
            'kondisi'     => 'required|in:baik,rusak_ringan,rusak_berat,hancur',
            'deskripsi'   => 'nullable|string',
        ]);

        $alat->update($validated);

        return response()->json([
            'message' => 'Data alat berhasil diperbarui',
            'data'    => $alat->load(['kategori', 'lokasi'])
        ]);
    }

    public function katalog()
    {
        $alats = Alat::with(['kategori', 'lokasi'])
            ->where('stok', '>', 0)
            ->latest()
            ->get();

        return response()->json($alats);
    }

    // Hapus Alat (Soft Delete)
    public function destroy($id)
    {
        $alat = Alat::findOrFail($id);
        $alat->delete();

        return response()->json(['message' => 'Alat berhasil dihapus']);
    }
}
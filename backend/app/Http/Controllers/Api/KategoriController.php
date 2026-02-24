<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use Illuminate\Http\Request;

class KategoriController extends Controller
{
    public function index()
    {
        // Bisa tambah withCount untuk hitung jumlah alat per kategori
        $kategoris = Kategori::withCount('alats')->get();
        return response()->json($kategoris);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:kategoris,nama_kategori',
            'deskripsi'     => 'nullable|string'
        ]);

        $kategori = Kategori::create($validated);
        return response()->json([
            'message' => 'Kategori berhasil dibuat', 
            'data' => $kategori
        ], 201);
    }

    public function show($id)
    {
        // Load alat-alat yang ada di kategori ini
        $kategori = Kategori::with('alats')->findOrFail($id);
        return response()->json($kategori);
    }

    public function update(Request $request, $id)
    {
        $kategori = Kategori::findOrFail($id);
        
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:kategoris,nama_kategori,' . $id,
            'deskripsi'     => 'nullable|string'
        ]);

        $kategori->update($validated);
        return response()->json([
            'message' => 'Kategori berhasil diupdate', 
            'data' => $kategori
        ]);
    }

    public function destroy($id)
    {
        $kategori = Kategori::findOrFail($id);
        
        // Cek apakah kategori masih punya alat
        if ($kategori->alats()->count() > 0) {
            return response()->json([
                'message' => 'Kategori tidak bisa dihapus karena masih ada alat yang menggunakan kategori ini'
            ], 400);
        }
        
        $kategori->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }
}
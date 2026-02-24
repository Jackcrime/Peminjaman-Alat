<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengembalian;
use App\Models\Peminjaman;
use App\Models\Alat;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PengembalianController extends Controller
{
    /**
     * Menampilkan daftar semua pengembalian (Admin/Petugas).
     */
    public function index()
    {
        $data = Pengembalian::with(['peminjaman.user', 'peminjaman.alat', 'kategori'])
            ->latest()
            ->get();
        
        return response()->json($data);
    }

    /**
     * Proses pengembalian barang dan update stok.
     */
    public function store(Request $request)
    {
        $request->validate([
            'peminjaman_id'           => [
                'required',
                'exists:peminjamans,id',
                'unique:pengembalians,peminjaman_id'
            ],
            'tgl_pengembalian_aktual' => 'required|date',
            'kondisi_saat_dikembalikan' => 'required|in:baik,rusak,hilang',
            'catatan'                 => 'nullable|string',
        ], [
            'peminjaman_id.unique' => 'Peminjaman ini sudah pernah dikembalikan sebelumnya.',
        ]);

        DB::beginTransaction();
        
        try {
            // 1. Ambil data peminjaman
            $peminjaman = Peminjaman::with('alat')->findOrFail($request->peminjaman_id);

            // Cek status peminjaman
            if ($peminjaman->status !== 'disetujui') {
                return response()->json([
                    'message' => 'Hanya peminjaman dengan status "disetujui" yang bisa dikembalikan.'
                ], 400);
            }

            // 2. LOCK data alat untuk mencegah race condition
            $alat = Alat::where('id', $peminjaman->alat_id)->lockForUpdate()->first();

            // 3. ✅ FIXED: Hitung Denda (Progressive Formula - Match Frontend)
            $tglSeharusnya = Carbon::parse($peminjaman->tgl_pengembalian);
            $tglAktual     = Carbon::parse($request->tgl_pengembalian_aktual);
            
            $denda = 0;
            if ($tglAktual->gt($tglSeharusnya)) {
                $selisihHari = $tglAktual->diffInDays($tglSeharusnya);
                
                // Progressive formula: Week 1 = 5k, Week 2 = 10k, ..., Max = 30k
                $weeksLate = ceil($selisihHari / 7);
                $denda = min(5000 + ($weeksLate - 1) * 5000, 30000);
                
                // Alternative linear formula (uncomment if needed):
                // $denda = $selisihHari * 5000; // Rp 5.000 per hari (no cap)
            }

            // 4. Simpan data pengembalian
            $pengembalian = Pengembalian::create([
                'peminjaman_id'             => $request->peminjaman_id,
                'kategori_id'               => $peminjaman->kategori_id,
                'tgl_pengembalian_aktual'   => $request->tgl_pengembalian_aktual,
                'denda'                     => $denda,
                'kondisi_saat_dikembalikan' => $request->kondisi_saat_dikembalikan,
                'catatan'                   => $request->catatan ?? 'Tidak ada catatan',
            ]);

            // 5. Update status peminjaman
            $peminjaman->update(['status' => 'selesai']);

            // 6. Kembalikan stok alat
            $alat->increment('stok', $peminjaman->jumlah);

            DB::commit();

            return response()->json([
                'message' => 'Pengembalian berhasil diproses. Stok alat telah diperbarui.',
                'denda'   => $denda,
                'selisih_hari' => $tglAktual->diffInDays($tglSeharusnya),
                'data'    => $pengembalian->load(['peminjaman.alat', 'peminjaman.user'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Detail pengembalian tertentu.
     */
    public function show($id)
    {
        $pengembalian = Pengembalian::with(['peminjaman.user', 'peminjaman.alat', 'kategori'])
            ->findOrFail($id);
        
        return response()->json($pengembalian);
    }

    /**
     * ✅ NEW: Update data pengembalian
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'tgl_pengembalian_aktual'   => 'sometimes|date',
            'kondisi_saat_dikembalikan' => 'sometimes|in:baik,rusak,hilang',
            'denda'                     => 'sometimes|numeric|min:0',
            'catatan'                   => 'nullable|string',
        ]);

        try {
            $pengembalian = Pengembalian::findOrFail($id);
            
            $pengembalian->update($request->only([
                'tgl_pengembalian_aktual',
                'kondisi_saat_dikembalikan',
                'denda',
                'catatan'
            ]));

            return response()->json([
                'message' => 'Data pengembalian berhasil diupdate',
                'data' => $pengembalian->load(['peminjaman.user', 'peminjaman.alat'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating pengembalian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hapus data pengembalian.
     */
    public function destroy($id)
    {
        $pengembalian = Pengembalian::findOrFail($id);
        $pengembalian->delete();

        return response()->json(['message' => 'Data pengembalian berhasil dihapus.']);
    }
}
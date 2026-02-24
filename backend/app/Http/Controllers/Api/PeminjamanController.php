<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use App\Models\Alat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PeminjamanController extends Controller
{
    /**
     * GET: List Peminjaman
     * Admin/Staff lihat semua, User lihat punya sendiri
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $query = Peminjaman::with(['alat.kategori', 'alat.lokasi', 'user', 'pengembalian']);

            // User hanya lihat punya sendiri
            if ($user->role === 'user') {
                $query->where('user_id', $user->id);
            }

            // Filter status jika ada
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Limit jika ada (untuk dashboard)
            if ($request->has('limit')) {
                $query->limit($request->limit);
            }

            $peminjaman = $query->latest()->get();

            return response()->json($peminjaman);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching peminjaman data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST: Ajukan Peminjaman Baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'alat_id'           => 'required|exists:alats,id',
            'jumlah'            => 'required|integer|min:1',
            'tgl_peminjaman'    => 'required|date',
            'tgl_pengembalian'  => 'required|date|after:tgl_peminjaman',
            'catatan'           => 'nullable|string'
        ]);

        DB::beginTransaction();

        try {
            $alat = Alat::findOrFail($request->alat_id);

            // Cek stok tersedia
            if ($alat->stok < $request->jumlah) {
                return response()->json([
                    'message' => 'Stok alat tidak mencukupi',
                    'stok_tersedia' => $alat->stok
                ], 400);
            }

            $peminjaman = Peminjaman::create([
                'user_id'          => $request->user()->id,
                'alat_id'          => $request->alat_id,
                'kategori_id'      => $alat->kategori_id,
                'jumlah'           => $request->jumlah,
                'tgl_peminjaman'   => $request->tgl_peminjaman,
                'tgl_pengembalian' => $request->tgl_pengembalian,
                'status'           => 'diajukan',
                'catatan'          => $request->catatan ?? '',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Pengajuan peminjaman berhasil',
                'data'    => $peminjaman->load(['alat.kategori', 'alat.lokasi', 'user'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating peminjaman',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET: Detail Peminjaman
     */
    public function show($id)
    {
        try {
            $peminjaman = Peminjaman::with(['alat.kategori', 'alat.lokasi', 'user', 'pengembalian'])
                ->findOrFail($id);
            
            return response()->json($peminjaman);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Peminjaman not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * PUT: Update Status Peminjaman (Approve/Reject)
     * Hanya untuk Staff & Admin
     */
    public function updateStatus(Request $request, $id)
    {
        // Double check role
        if ($request->user()->role === 'user') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:disetujui,ditolak'
        ]);

        DB::beginTransaction();

        try {
            $peminjaman = Peminjaman::findOrFail($id);
            
            // Cek apakah sudah diproses
            if ($peminjaman->status !== 'diajukan') {
                return response()->json([
                    'message' => 'Peminjaman sudah diproses sebelumnya',
                    'current_status' => $peminjaman->status
                ], 400);
            }

            // Jika disetujui, kurangi stok
            if ($request->status === 'disetujui') {
                $alat = Alat::where('id', $peminjaman->alat_id)
                    ->lockForUpdate()
                    ->first();

                if (!$alat) {
                    throw new \Exception("Alat tidak ditemukan");
                }

                if ($alat->stok < $peminjaman->jumlah) {
                    throw new \Exception("Stok tidak mencukupi, hanya tersisa {$alat->stok}");
                }

                // Kurangi stok
                $alat->decrement('stok', $peminjaman->jumlah);
            }

            // Update status peminjaman
            $peminjaman->update(['status' => $request->status]);

            DB::commit();
            
            return response()->json([
                'message' => 'Status peminjaman berhasil diupdate',
                'data'    => $peminjaman->load(['alat.kategori', 'user'])
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
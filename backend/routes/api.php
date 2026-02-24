<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AlatController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\LokasiController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PeminjamanController;
use App\Http\Controllers\Api\PengembalianController;
use App\Http\Controllers\Api\LogAktifitasController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes - Digitaris (FINAL VERSION)
|--------------------------------------------------------------------------
| Complete API routes untuk Inventory Management System
| Role-based access: admin, staff, user
| Menggunakan CheckRole middleware yang sudah ada
*/

// ==================== PUBLIC ROUTES (NO AUTH) ====================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ==================== PROTECTED ROUTES (REQUIRE AUTH) ====================
Route::middleware('auth:sanctum')->group(function () {
    
    // ==================== AUTH ====================
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // ==================== DASHBOARD ====================
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // ==================== ALAT ====================
    Route::get('/alats', [AlatController::class, 'index']);
    Route::get('/alats/{id}', [AlatController::class, 'show']);
    Route::post('/alats', [AlatController::class, 'store']);
    Route::put('/alats/{id}', [AlatController::class, 'update']);
    Route::delete('/alats/{id}', [AlatController::class, 'destroy']);
    
    // Katalog Alat (untuk user lihat available alat)
    Route::get('/katalog-alat', [AlatController::class, 'katalog']);
    
    // ==================== KATEGORI ====================
    Route::get('/kategoris', [KategoriController::class, 'index']);
    Route::get('/kategoris/{id}', [KategoriController::class, 'show']);
    Route::post('/kategoris', [KategoriController::class, 'store']);
    Route::put('/kategoris/{id}', [KategoriController::class, 'update']);
    Route::delete('/kategoris/{id}', [KategoriController::class, 'destroy']);
    
    // ==================== LOKASI ====================
    Route::get('/lokasis', [LokasiController::class, 'index']);
    Route::get('/lokasis/{id}', [LokasiController::class, 'show']);
    Route::post('/lokasis', [LokasiController::class, 'store']);
    Route::put('/lokasis/{id}', [LokasiController::class, 'update']);
    Route::delete('/lokasis/{id}', [LokasiController::class, 'destroy']);
    
    // ==================== USERS ====================
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    
    // ==================== PEMINJAMAN ====================
    Route::get('/peminjaman', [PeminjamanController::class, 'index']);
    // POST /peminjaman - Ajukan peminjaman baru (dari KatalogAlat)
    Route::post('/peminjaman', [PeminjamanController::class, 'store']);
    // GET /peminjaman/{id} - Detail peminjaman
    Route::get('/peminjaman/{id}', [PeminjamanController::class, 'show']);
    // PUT /peminjaman/{id}/status - Approve/Reject peminjaman (admin/staff only)
    Route::put('/peminjaman/{id}/status', [PeminjamanController::class, 'updateStatus']);
    // DELETE /peminjaman/{id} - Hapus peminjaman
    Route::delete('/peminjaman/{id}', [PeminjamanController::class, 'destroy']);
    
    // ==================== PENGEMBALIAN ====================
    Route::get('/pengembalian', [PengembalianController::class, 'index']);
    Route::get('/pengembalian/{id}', [PengembalianController::class, 'show']);
    Route::post('/pengembalian', [PengembalianController::class, 'store']);
    Route::put('/pengembalian/{id}', [PengembalianController::class, 'update']);
    Route::delete('/pengembalian/{id}', [PengembalianController::class, 'destroy']);
    
    // ==================== LOG AKTIFITAS (Admin & Staff Only) ====================
    Route::middleware('role:admin,staff')->group(function () {
        Route::get('/logs', [LogAktifitasController::class, 'index']);
        Route::delete('/logs/{id}', [LogAktifitasController::class, 'destroy']);
    });
});

/*
|--------------------------------------------------------------------------
| Route Summary
|--------------------------------------------------------------------------
| 
| PUBLIC (2):
| - POST /login
| - POST /register
| 
| AUTH (2):
| - POST /logout
| - GET /me
| 
| DASHBOARD (1):
| - GET /dashboard
| 
| ALAT (6):
| - GET /alats
| - GET /alats/{id}
| - POST /alats
| - PUT /alats/{id}
| - DELETE /alats/{id}
| - GET /katalog-alat
| 
| KATEGORI (5):
| - GET /kategoris
| - GET /kategoris/{id}
| - POST /kategoris
| - PUT /kategoris/{id}
| - DELETE /kategoris/{id}
| 
| LOKASI (5):
| - GET /lokasis
| - GET /lokasis/{id}
| - POST /lokasis
| - PUT /lokasis/{id}
| - DELETE /lokasis/{id}
| 
| USERS (5):
| - GET /users
| - GET /users/{id}
| - POST /users
| - PUT /users/{id}
| - DELETE /users/{id}
| 
| PEMINJAMAN (5):
| - GET /peminjaman
| - POST /peminjaman ← FIX 404! CRITICAL!
| - GET /peminjaman/{id}
| - PUT /peminjaman/{id}/status
| - DELETE /peminjaman/{id}
| 
| PENGEMBALIAN (4):
| - GET /pengembalian
| - GET /pengembalian/{id}
| - POST /pengembalian
| - DELETE /pengembalian/{id}
| 
| LOGS (2) - Admin & Staff Only:
| - GET /logs
| - DELETE /logs/{id}
| 
| TOTAL ROUTES: 37
|--------------------------------------------------------------------------
|
| MIDDLEWARE USED:
| - auth:sanctum (all protected routes)
| - role:admin,staff (logs only)
|
| NOTE: 
| CheckRole middleware already registered in bootstrap/app.php
| No need for additional middleware registration!
|--------------------------------------------------------------------------
*/
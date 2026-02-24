<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\LogAktifitas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user' // Default role untuk peminjam/siswa
        ]);

        // Hapus token lama jika ada
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        // Log aktivitas registrasi
        LogAktifitas::create([
            'user_id' => $user->id,
            'aktifitas' => 'Registrasi akun baru',
            'keterangan' => "User {$user->name} berhasil mendaftar dengan email {$user->email}",
            'waktu' => now(),
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil',
            'token' => $token,
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // Hapus token lama
        $user->tokens()->delete();

        // Buat token baru
        $token = $user->createToken('auth_token')->plainTextToken;

        // Log aktivitas login
        LogAktifitas::create([
            'user_id' => $user->id,
            'aktifitas' => 'Login ke sistem',
            'keterangan' => "User {$user->name} ({$user->role}) berhasil login",
            'waktu' => now(),
        ]);

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        // Log aktivitas logout
        LogAktifitas::create([
            'user_id' => $user->id,
            'aktifitas' => 'Logout dari sistem',
            'keterangan' => "User {$user->name} telah logout",
            'waktu' => now(),
        ]);

        $request->user()->currentAccessToken()->delete();
        
        return response()->json(['message' => 'Logout berhasil']);
    }
}
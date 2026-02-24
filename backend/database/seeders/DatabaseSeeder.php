<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Kategori;
use App\Models\Lokasi;
use App\Models\Alat;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // === USERS ===
        User::create([
            'name' => 'Admin Utama',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Staff Laboratorium',
            'email' => 'staff@example.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
        ]);

        User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'kelas' => 'XII RPL 1',
        ]);

        User::create([
            'name' => 'Siti Aminah',
            'email' => 'siti@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'kelas' => 'XII RPL 2',
        ]);

        // === KATEGORI ===
        $elektronik = Kategori::create([
            'nama_kategori' => 'Elektronik',
            'deskripsi' => 'Peralatan elektronik dan komputer',
        ]);

        $kimia = Kategori::create([
            'nama_kategori' => 'Kimia',
            'deskripsi' => 'Peralatan laboratorium kimia',
        ]);

        $fisika = Kategori::create([
            'nama_kategori' => 'Fisika',
            'deskripsi' => 'Peralatan laboratorium fisika',
        ]);

        $multimedia = Kategori::create([
            'nama_kategori' => 'Multimedia',
            'deskripsi' => 'Peralatan multimedia dan broadcasting',
        ]);

        // === LOKASI ===
        $labKomputer = Lokasi::create([
            'nama_ruangan' => 'Lab Komputer 1',
            'kode_ruangan' => 'LAB-KOMP-01',
            'deskripsi' => 'Laboratorium komputer lantai 2',
        ]);

        $labKimia = Lokasi::create([
            'nama_ruangan' => 'Lab Kimia',
            'kode_ruangan' => 'LAB-KIM-01',
            'deskripsi' => 'Laboratorium kimia lantai 3',
        ]);

        $labFisika = Lokasi::create([
            'nama_ruangan' => 'Lab Fisika',
            'kode_ruangan' => 'LAB-FIS-01',
            'deskripsi' => 'Laboratorium fisika lantai 3',
        ]);

        $labMultimedia = Lokasi::create([
            'nama_ruangan' => 'Studio Multimedia',
            'kode_ruangan' => 'LAB-MM-01',
            'deskripsi' => 'Studio multimedia lantai 2',
        ]);

        // === ALAT ===
        Alat::create([
            'nama_alat' => 'Laptop ASUS ROG',
            'kode_alat' => 'LPT-001',
            'stok' => 10,
            'kategori_id' => $elektronik->id,
            'lokasi_id' => $labKomputer->id,
            'kondisi' => 'baik',
            'deskripsi' => 'Laptop gaming untuk rendering dan programming',
        ]);

        Alat::create([
            'nama_alat' => 'Mikroskop Digital',
            'kode_alat' => 'MKS-001',
            'stok' => 5,
            'kategori_id' => $kimia->id,
            'lokasi_id' => $labKimia->id,
            'kondisi' => 'baik',
            'deskripsi' => 'Mikroskop digital dengan kamera 5MP',
        ]);

        Alat::create([
            'nama_alat' => 'Oscilloscope',
            'kode_alat' => 'OSC-001',
            'stok' => 3,
            'kategori_id' => $fisika->id,
            'lokasi_id' => $labFisika->id,
            'kondisi' => 'baik',
            'deskripsi' => 'Oscilloscope digital untuk praktikum',
        ]);

        Alat::create([
            'nama_alat' => 'Kamera DSLR Canon',
            'kode_alat' => 'CAM-001',
            'stok' => 4,
            'kategori_id' => $multimedia->id,
            'lokasi_id' => $labMultimedia->id,
            'kondisi' => 'baik',
            'deskripsi' => 'DSLR Canon EOS 80D dengan lensa kit',
        ]);

        Alat::create([
            'nama_alat' => 'Tripod Professional',
            'kode_alat' => 'TRP-001',
            'stok' => 8,
            'kategori_id' => $multimedia->id,
            'lokasi_id' => $labMultimedia->id,
            'kondisi' => 'baik',
            'deskripsi' => 'Tripod untuk kamera dan video',
        ]);

        Alat::create([
            'nama_alat' => 'Arduino Uno Kit',
            'kode_alat' => 'ARD-001',
            'stok' => 15,
            'kategori_id' => $elektronik->id,
            'lokasi_id' => $labKomputer->id,
            'kondisi' => 'baik',
            'deskripsi' => 'Kit Arduino Uno lengkap dengan sensor',
        ]);

        Alat::create([
            'nama_alat' => 'Multimeter Digital',
            'kode_alat' => 'MLT-001',
            'stok' => 20,
            'kategori_id' => $fisika->id,
            'lokasi_id' => $labFisika->id,
            'kondisi' => 'baik',
            'deskripsi' => 'Multimeter digital untuk mengukur arus, tegangan, dan resistansi',
        ]);

        Alat::create([
            'nama_alat' => 'Projector Epson',
            'kode_alat' => 'PRJ-001',
            'stok' => 2,
            'kategori_id' => $multimedia->id,
            'lokasi_id' => $labMultimedia->id,
            'kondisi' => 'baik',
            'deskripsi' => 'Projector Epson EB-X41 3600 lumens',
        ]);
    }
}
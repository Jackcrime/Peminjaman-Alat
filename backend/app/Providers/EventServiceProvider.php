<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Models\Alat;
use App\Models\Kategori;
use App\Models\Lokasi;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use App\Models\User;
use App\Observers\AlatObserver;
use App\Observers\KategoriObserver;
use App\Observers\LokasiObserver;
use App\Observers\PeminjamanObserver;
use App\Observers\PengembalianObserver;
use App\Observers\UserObserver;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        // Event listener mappings jika ada
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        // Register Observers untuk auto-logging
        Alat::observe(AlatObserver::class);
        Kategori::observe(KategoriObserver::class);
        Lokasi::observe(LokasiObserver::class);
        Peminjaman::observe(PeminjamanObserver::class);
        Pengembalian::observe(PengembalianObserver::class);
        User::observe(UserObserver::class);
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
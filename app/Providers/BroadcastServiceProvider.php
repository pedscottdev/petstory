<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Broadcast::routes([
            // DÙNG /api/broadcasting/auth như bạn đang gọi
            'prefix'     => 'api',
            'middleware' => ['api', 'auth:sanctum'],
        ]);

        // Đảm bảo load routes/channels.php
        require base_path('routes/channels.php');
    }
}

<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Console\Commands\TruncateUsersCommand;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Register custom commands
Artisan::command('db:truncate-users', function () {
    $this->call(TruncateUsersCommand::class);
})->purpose('Truncate all records in the users collection and reset the ID counter');
<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TruncateUsersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:truncate-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Truncate all records in the users collection and reset the ID counter';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->confirm('This will delete all users from the database. Are you sure you want to continue?')) {
            try {
                // Truncate the users collection
                User::truncate();
                
                $this->info('All users have been successfully deleted.');
            } catch (\Exception $e) {
                $this->error('An error occurred while truncating users: ' . $e->getMessage());
            }
        } else {
            $this->info('Operation cancelled.');
        }
    }
}
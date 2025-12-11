<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Post;
use App\Models\PostMultimedia;
use App\Services\ImageUploadService;
use Illuminate\Support\Facades\Log;

class DeletePostCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'post:delete {postId : The ID of the post to delete}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete a post and all its associated images';

    protected $imageUploadService;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(ImageUploadService $imageUploadService)
    {
        parent::__construct();
        $this->imageUploadService = $imageUploadService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $postId = $this->argument('postId');

        // Find the post
        $post = Post::find($postId);

        if (!$post) {
            $this->error("Post with ID {$postId} not found!");
            return 1;
        }

        $this->info("Found post: {$post->content}");
        $this->info("Author: {$post->author->first_name} {$post->author->last_name}");

        // Get all multimedia files
        $multimediaFiles = PostMultimedia::where('post_id', $postId)->get();
        $imageCount = $multimediaFiles->count();

        if ($imageCount > 0) {
            $this->info("Found {$imageCount} image(s) associated with this post.");
        } else {
            $this->info("No images associated with this post.");
        }

        // Confirm deletion
        if (!$this->confirm('Do you want to proceed with deletion?')) {
            $this->info('Deletion cancelled.');
            return 0;
        }

        $deletedImages = 0;
        $failedImages = 0;

        // Delete physical files from storage
        $this->info('Deleting images from storage...');
        foreach ($multimediaFiles as $media) {
            if ($media->file_url) {
                try {
                    $this->imageUploadService->deleteImage($media->file_url);
                    $this->line("✓ Deleted: {$media->file_url}");
                    $deletedImages++;
                } catch (\Exception $e) {
                    $this->warn("✗ Failed to delete: {$media->file_url}");
                    $this->warn("  Error: {$e->getMessage()}");
                    Log::warning("Failed to delete image file: {$media->file_url}", [
                        'error' => $e->getMessage()
                    ]);
                    $failedImages++;
                }
            }
        }

        // Delete database records
        $this->info('Deleting database records...');
        
        // Delete multimedia records
        PostMultimedia::where('post_id', $postId)->delete();
        $this->line('✓ Deleted multimedia records');

        // Delete the post
        $post->delete();
        $this->line('✓ Deleted post record');

        // Summary
        $this->newLine();
        $this->info('=== Deletion Summary ===');
        $this->info("Post ID: {$postId}");
        $this->info("Images deleted: {$deletedImages}");
        if ($failedImages > 0) {
            $this->warn("Images failed: {$failedImages}");
        }
        $this->info('Database records: Deleted');
        $this->newLine();
        $this->info('✓ Post deletion completed successfully!');

        return 0;
    }
}

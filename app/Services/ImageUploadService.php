<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class ImageUploadService
{
    /**
     * Upload user avatar
     *
     * @param UploadedFile $file
     * @param string $userId
     * @param string|null $oldAvatarPath
     * @return array
     */
    public function uploadUserAvatar(UploadedFile $file, string $userId, ?string $oldAvatarPath = null): array
    {
        return $this->uploadImage($file, "uploads/users/{$userId}", 'avatar', $oldAvatarPath);
    }

    /**
     * Upload pet avatar
     *
     * @param UploadedFile $file
     * @param string $petId
     * @param string|null $oldAvatarPath
     * @return array
     */
    public function uploadPetAvatar(UploadedFile $file, string $petId, ?string $oldAvatarPath = null): array
    {
        return $this->uploadImage($file, "uploads/pets/{$petId}", 'avatar', $oldAvatarPath);
    }

    /**
     * Upload group avatar
     *
     * @param UploadedFile $file
     * @param string $groupId
     * @param string|null $oldAvatarPath
     * @return array
     */
    public function uploadGroupAvatar(UploadedFile $file, string $groupId, ?string $oldAvatarPath = null): array
    {
        return $this->uploadImage($file, "uploads/groups/{$groupId}", 'avatar', $oldAvatarPath);
    }

    /**
     * Upload group cover image
     *
     * @param UploadedFile $file
     * @param string $groupId
     * @param string|null $oldCoverPath
     * @return array
     */
    public function uploadGroupCover(UploadedFile $file, string $groupId, ?string $oldCoverPath = null): array
    {
        return $this->uploadImage($file, "uploads/groups/{$groupId}", 'cover', $oldCoverPath);
    }

    /**
     * Upload post image
     *
     * @param UploadedFile $file
     * @param string $postId
     * @return array
     */
    public function uploadPostImage(UploadedFile $file, string $postId): array
    {
        return $this->uploadImage($file, "uploads/posts/{$postId}", 'image');
    }

    /**
     * Upload multiple post images
     *
     * @param array $files
     * @param string $postId
     * @return array
     */
    public function uploadMultiplePostImages(array $files, string $postId): array
    {
        $results = [];
        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $results[] = $this->uploadPostImage($file, $postId);
            }
        }
        return $results;
    }

    /**
     * Generic image upload method
     *
     * @param UploadedFile $file
     * @param string $folder
     * @param string $prefix
     * @param string|null $oldPath
     * @return array
     */
    public function uploadImage(UploadedFile $file, string $folder, string $prefix, ?string $oldPath = null): array
    {
        // Validate image
        if (!$this->isValidImage($file)) {
            throw new \Exception('Invalid image file');
        }

        // Delete old image if exists
        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        $filename = $prefix . '_' . time() . '.' . $extension;

        // Store the file
        $path = $file->storeAs($folder, $filename, 'public');

        // Return both relative and full URLs
        return [
            'path' => $path,
            'url' => $this->getFullUrl($path),
        ];
    }

    /**
     * Check if file is a valid image
     *
     * @param UploadedFile $file
     * @return bool
     */
    protected function isValidImage(UploadedFile $file): bool
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        $maxSize = 2048 * 1024; // 2MB in bytes

        return in_array($file->getMimeType(), $allowedMimes) && $file->getSize() <= $maxSize;
    }

    /**
     * Get full URL for an image path
     *
     * @param string $path
     * @return string
     */
    protected function getFullUrl(string $path): string
    {
        return config('app.url') . '/storage/' . $path;
    }

    /**
     * Delete image
     *
     * @param string $path
     * @return bool
     */
    public function deleteImage(string $path): bool
    {
        if ($path && Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        return false;
    }

    /**
     * Get public URL from path
     *
     * @param string|null $path
     * @return string|null
     */
    public function getUrlFromPath(?string $path): ?string
    {
        if (!$path) {
            return null;
        }
        return $this->getFullUrl($path);
    }
}

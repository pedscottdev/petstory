/**
 * Image utilities for handling image paths and URLs
 */

/**
 * Get full image URL from relative path
 * @param {string} path - Relative path from storage
 * @returns {string} - Full URL
 */
export const getImageUrl = (path) => {
    if (!path) return '';
    
    // If already a full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    
    // If starts with /storage, use current origin
    if (path.startsWith('/storage/')) {
        return `${window.location.origin}${path}`;
    }
    
    // Otherwise, prepend /storage/
    return `${window.location.origin}/storage/${path}`;
};

/**
 * Get avatar URL with fallback
 * @param {string} avatarPath - Avatar path
 * @param {string} name - User/Pet name for fallback
 * @returns {string} - Avatar URL
 */
export const getAvatarUrl = (avatarPath, name = 'User') => {
    if (avatarPath && avatarPath.trim()) {
        return getImageUrl(avatarPath);
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
};

/**
 * Get group avatar URL with fallback to default image
 * @param {string} avatarPath - Avatar path
 * @returns {string} - Avatar URL or default image
 */
export const getGroupAvatarUrl = (avatarPath) => {
    if (avatarPath && avatarPath.trim()) {
        return getImageUrl(avatarPath);
    }
    return `/images/default-image.png`;
};

/**
 * Validate image file
 * @param {File} file - File object
 * @param {number} maxSizeMB - Maximum file size in MB (default: 2)
 * @returns {Object} - {valid: boolean, error: string|null}
 */
export const validateImageFile = (file, maxSizeMB = 2) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Check file type
    if (!allowedMimes.includes(file.type)) {
        return {
            valid: false,
            error: `Định dạng ảnh không hợp lệ. Vui lòng sử dụng JPG, PNG hoặc WebP`,
        };
    }

    // Check file size
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `Kích thước ảnh không được vượt quá ${maxSizeMB}MB`,
        };
    }

    return { valid: true, error: null };
};

/**
 * Get file extension
 * @param {string} filename - File name
 * @returns {string} - File extension
 */
export const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
};

/**
 * Generate unique filename
 * @param {string} prefix - File prefix (e.g., 'avatar', 'cover', 'image')
 * @param {string} extension - File extension
 * @returns {string} - Unique filename
 */
export const generateUniqueFilename = (prefix, extension) => {
    const timestamp = Date.now();
    return `${prefix}_${timestamp}.${extension}`;
};

/**
 * Create preview URL from file
 * @param {File} file - File object
 * @returns {Promise<string>} - Data URL for preview
 */
export const createPreviewUrl = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Create multiple preview URLs from files
 * @param {File[]} files - Array of file objects
 * @returns {Promise<string[]>} - Array of data URLs
 */
export const createMultiplePreviewUrls = async (files) => {
    const promises = Array.from(files).map((file) => createPreviewUrl(file));
    return Promise.all(promises);
};

/**
 * Get display name from file
 * @param {File} file - File object
 * @returns {string} - Display name
 */
export const getFileDisplayName = (file) => {
    const name = file.name;
    return name.length > 30 ? name.substring(0, 27) + '...' : name;
};

/**
 * Format file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check if file is image
 * @param {File} file - File object
 * @returns {boolean}
 */
export const isImageFile = (file) => {
    return file.type.startsWith('image/');
};

/**
 * Get image dimensions
 * @param {string} imageUrl - Image URL or data URL
 * @returns {Promise<Object>} - {width, height}
 */
export const getImageDimensions = (imageUrl) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = imageUrl;
    });
};

/**
 * Crop image to specified dimensions
 * @param {string} imageUrl - Image URL or data URL
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {Promise<Blob>} - Cropped image blob
 */
export const cropImage = (imageUrl, width, height) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = width;
            canvas.height = height;
            
            // Center crop
            const sourceWidth = img.width;
            const sourceHeight = img.height;
            const sourceX = (sourceWidth - width) / 2;
            const sourceY = (sourceHeight - height) / 2;
            
            ctx.drawImage(
                img,
                sourceX,
                sourceY,
                width,
                height,
                0,
                0,
                width,
                height
            );
            
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.95);
        };
        img.onerror = reject;
        img.src = imageUrl;
    });
};

/**
 * Compress image
 * @param {File} file - Image file
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = (file, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, file.type, quality);
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Resize image to specified dimensions
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Promise<Blob>} - Resized image blob
 */
export const resizeImage = (file, maxWidth = 1920, maxHeight = 1080) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, file.type, 0.9);
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default {
    getImageUrl,
    getAvatarUrl,
    getGroupAvatarUrl,
    validateImageFile,
    getFileExtension,
    generateUniqueFilename,
    createPreviewUrl,
    createMultiplePreviewUrls,
    getFileDisplayName,
    formatFileSize,
    isImageFile,
    getImageDimensions,
    cropImage,
    compressImage,
    resizeImage,
};

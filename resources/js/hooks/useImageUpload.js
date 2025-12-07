import { useState } from 'react';
import httpClient from '../api/httpClient';

/**
 * Hook for handling image uploads to various endpoints
 * @returns {Object} - Object containing upload functions and state
 */
export const useImageUpload = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    /**
     * Upload user avatar
     * @param {File} file - Image file to upload
     * @returns {Promise<Object>} - Upload result with path and URL
     */
    const uploadUserAvatar = async (file) => {
        return uploadImage(file, 'upload/user-avatar', 'avatar');
    };

    /**
     * Upload pet avatar
     * @param {File} file - Image file to upload
     * @param {string} petId - Pet ID
     * @returns {Promise<Object>} - Upload result with path and URL
     */
    const uploadPetAvatar = async (file, petId) => {
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('pet_id', petId);
        return uploadFormData(formData, 'upload/pet-avatar');
    };

    /**
     * Upload group avatar
     * @param {File} file - Image file to upload
     * @param {string} groupId - Group ID
     * @returns {Promise<Object>} - Upload result with path and URL
     */
    const uploadGroupAvatar = async (file, groupId) => {
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('group_id', groupId);
        return uploadFormData(formData, 'upload/group-avatar');
    };

    /**
     * Upload group cover image
     * @param {File} file - Image file to upload
     * @param {string} groupId - Group ID
     * @returns {Promise<Object>} - Upload result with path and URL
     */
    const uploadGroupCover = async (file, groupId) => {
        const formData = new FormData();
        formData.append('cover', file);
        formData.append('group_id', groupId);
        return uploadFormData(formData, 'upload/group-cover');
    };

    /**
     * Upload post images
     * @param {File|File[]} files - Image file(s) to upload
     * @param {string} postId - Post ID
     * @returns {Promise<Array>} - Array of upload results
     */
    const uploadPostImages = async (files, postId) => {
        const formData = new FormData();
        
        // Handle both single file and multiple files
        const fileArray = Array.isArray(files) ? files : [files];
        fileArray.forEach((file) => {
            formData.append('images[]', file);
        });
        
        formData.append('post_id', postId);
        return uploadFormData(formData, 'upload/post-images');
    };

    /**
     * Delete image
     * @param {string} path - Relative path of the image
     * @returns {Promise<Object>} - Delete result
     */
    const deleteImage = async (path) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await httpClient.post('upload/delete-image', {
                path: path,
            });

            setSuccess(true);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi xóa ảnh');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Internal function to upload single image
     * @param {File} file - Image file to upload
     * @param {string} endpoint - API endpoint
     * @param {string} fieldName - Form field name
     * @returns {Promise<Object>} - Upload result
     */
    const uploadImage = async (file, endpoint, fieldName) => {
        const formData = new FormData();
        formData.append(fieldName, file);
        return uploadFormData(formData, endpoint);
    };

    /**
     * Internal function to upload FormData
     * @param {FormData} formData - FormData object
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} - Upload result
     */
    const uploadFormData = async (formData, endpoint) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await httpClient.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.success) {
                setSuccess(true);
                return response.data;
            } else {
                setError(response.message || 'Lỗi khi tải lên ảnh');
                throw new Error(response.message);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi tải lên ảnh';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        uploadUserAvatar,
        uploadPetAvatar,
        uploadGroupAvatar,
        uploadGroupCover,
        uploadPostImages,
        deleteImage,
        isLoading,
        error,
        success,
    };
};

export default useImageUpload;

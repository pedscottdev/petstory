import httpClient from './httpClient';

/**
 * Get notifications with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 5)
 * @returns {Promise} API response
 */
export const getNotifications = async (page = 1, perPage = 5) => {
    return httpClient.get(`/notifications?page=${page}&per_page=${perPage}`);
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise} API response
 */
export const markNotificationAsRead = async (notificationId) => {
    return httpClient.put(`/notifications/${notificationId}/read`);
};

/**
 * Mark all notifications as read
 * @returns {Promise} API response
 */
export const markAllNotificationsAsRead = async () => {
    return httpClient.put('/notifications/read-all');
};

/**
 * Mark all notifications as received (when user clicks bell icon)
 * @returns {Promise} API response
 */
export const markNotificationsAsReceived = async () => {
    return httpClient.put('/notifications/received');
};

/**
 * Get unread notifications count
 * @returns {Promise} API response with count
 */
export const getUnreadCount = async () => {
    return httpClient.get('/notifications/unread-count');
};

/**
 * Get unreceived notifications count (for badge display)
 * @returns {Promise} API response with count
 */
export const getUnreceivedCount = async () => {
    return httpClient.get('/notifications/unreceived-count');
};


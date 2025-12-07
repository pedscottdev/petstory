import httpClient from './httpClient';

/**
 * Get admin dashboard statistics
 * @returns {Promise} Dashboard stats including totals, percentages, and top users/pets
 */
export const getDashboardStats = () => {
    return httpClient.get('/admin/dashboard/stats');
};

/**
 * Get list of users for admin management
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search by name
 * @param {string} params.status - Filter by status ('all', 'active', 'inactive')
 * @param {string} params.from_date - Filter by join date start (YYYY-MM-DD)
 * @param {string} params.to_date - Filter by join date end (YYYY-MM-DD)
 * @param {number} params.page - Page number
 * @param {number} params.per_page - Items per page
 * @returns {Promise} Users list with pagination
 */
export const getUsers = (params = {}) => {
    return httpClient.get('/admin/users', { params });
};

/**
 * Toggle user active status (activate/deactivate)
 * @param {string} userId - The user ID to toggle
 * @returns {Promise} Updated user data
 */
export const toggleUserStatus = (userId) => {
    return httpClient.put(`/admin/users/${userId}/toggle-status`);
};

/**
 * Get list of posts for admin management
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search by author name
 * @param {string} params.status - Filter by status ('all', 'displayed', 'blocked')
 * @param {number} params.page - Page number
 * @param {number} params.per_page - Items per page
 * @returns {Promise} Posts list with pagination
 */
export const getPosts = (params = {}) => {
    return httpClient.get('/admin/posts', { params });
};

/**
 * Toggle post block status (block/unblock)
 * @param {string} postId - The post ID to toggle
 * @returns {Promise} Updated post data
 */
export const togglePostBlock = (postId) => {
    return httpClient.put(`/admin/posts/${postId}/toggle-block`);
};

/**
 * Get list of reports for admin management
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status ('all', 'pending', 'resolved')
 * @param {string} params.target_type - Filter by target type ('all', 'post', 'user')
 * @param {number} params.page - Page number
 * @param {number} params.per_page - Items per page
 * @returns {Promise} Reports list with pagination
 */
export const getReports = (params = {}) => {
    return httpClient.get('/admin/reports', { params });
};

/**
 * Resolve a report (confirm violation or no violation)
 * @param {string} reportId - The report ID to resolve
 * @param {Object} data - Resolution data
 * @param {string} data.resolution - 'violation' or 'no_violation'
 * @returns {Promise} Updated report data
 */
export const resolveReport = (reportId, data) => {
    return httpClient.put(`/admin/reports/${reportId}/resolve`, data);
};

/**
 * Get post details for a report
 * @param {string} postId - The post ID
 * @returns {Promise} Post details
 */
export const getReportPostDetails = (postId) => {
    return httpClient.get(`/admin/reports/post/${postId}`);
};

import httpClient from './httpClient';

/**
 * Search users and pets by query
 * @param {string} query - Search query
 * @param {number} limit - Maximum results per type (default: 20)
 * @returns {Promise} API response with users and pets
 */
export const searchUsersAndPets = async (query, limit = 20) => {
    return httpClient.get(`/search?query=${encodeURIComponent(query)}&limit=${limit}`);
};

/**
 * Get search suggestions (5 users and 5 pets from following/followers)
 * @returns {Promise} API response with suggested users and pets
 */
export const getSearchSuggestions = async () => {
    return httpClient.get('/search/suggestions');
};


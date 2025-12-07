import httpClient from './httpClient';

// User list and profile
export const getUsers = (page = 1, perPage = 15) => {
  return httpClient.get('/users', {
    params: { page, per_page: perPage }
  });
};

export const getUserProfile = (userId, postsPage = 1, postsPerPage = 15) => {
  return httpClient.get(`/users/profile/${userId}`, {
    params: { posts_page: postsPage, posts_per_page: postsPerPage }
  });
};

export const getUserWithPets = (userId) => {
  return httpClient.get(`/users/${userId}/with-pets`);
};

export const updateUserProfile = (profileData) => {
  return httpClient.put('/users/profile', profileData);
};

export const changePassword = (currentPassword, newPassword, passwordConfirmation) => {
  return httpClient.post('/users/change-password', {
    current_password: currentPassword,
    password: newPassword,
    password_confirmation: passwordConfirmation
  });
};

// User suggestions
export const getInitialSuggestionsData = (prominentLimit = 3, peopleLimit = 6) => {
  return httpClient.get('/users/initial-suggestions', {
    params: { 
      prominent_limit: prominentLimit,
      people_limit: peopleLimit
    }
  });
};

export const getProminentUsers = (limit = 3) => {
  return httpClient.get('/users/prominent', {
    params: { limit }
  });
};

export const getUserSuggestions = (limit = 10) => {
  return httpClient.get('/users/suggestions', {
    params: { limit }
  });
};

export const getPeopleYouMayKnow = (limit = 10) => {
  return httpClient.get('/users/people-you-may-know', {
    params: { limit }
  });
};

// Follow system
export const getFollowers = (userId, limit = 20) => {
  return httpClient.get(`/users/${userId}/followers`, {
    params: { limit }
  });
};

export const getFollowing = (userId, limit = 20) => {
  return httpClient.get(`/users/${userId}/following`, {
    params: { limit }
  });
};

export const toggleFollow = (followingId) => {
  return httpClient.post(`/users/${followingId}/toggle-follow`);
};

export const isFollowing = (followingId) => {
  return httpClient.get(`/users/${followingId}/is-following`);
};

// Newfeed data
export const getNewfeedData = (peopleLimit = 5, page = 1, perPage = 15) => {
  return httpClient.get('/users/newfeed-data', {
    params: {
      people_limit: peopleLimit,
      page,
      per_page: perPage
    }
  });
};

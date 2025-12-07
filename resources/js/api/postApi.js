import httpClient from './httpClient';

// Post CRUD operations
export const getPosts = (page = 1, perPage = 15) => {
  return httpClient.get('/posts', {
    params: { page, per_page: perPage }
  });
};

export const getPostById = (postId) => {
  return httpClient.get(`/posts/${postId}`);
};

export const createPost = (postData) => {
  return httpClient.post('/posts', postData);
};

export const updatePost = (postId, postData) => {
  return httpClient.put(`/posts/${postId}`, postData);
};

export const deletePost = (postId) => {
  return httpClient.delete(`/posts/${postId}`);
};

// Post feed
export const getFilteredFeed = (filterType, page = 1, perPage = 15) => {
  return httpClient.get('/posts/feed/filtered', {
    params: {
      filter_type: filterType,
      page,
      per_page: perPage
    }
  });
};

export const getUserFeed = (page = 1, perPage = 15) => {
  return httpClient.get('/posts/feed', {
    params: { page, per_page: perPage }
  });
};

// Post likes
export const togglePostLike = (postId) => {
  return httpClient.post(`/posts/${postId}/toggle-like`);
};

export const getPostLikeCount = (postId) => {
  return httpClient.get(`/posts/${postId}/like-count`);
};

export const hasLikedPost = (postId) => {
  return httpClient.get(`/posts/${postId}/is-liked`);
};

// Post comments
export const getPostComments = (postId, limit = 50) => {
  return httpClient.get(`/posts/${postId}/comments`, {
    params: { limit }
  });
};

export const addComment = (postId, content) => {
  return httpClient.post(`/posts/${postId}/comments`, {
    content
  });
};

export const deleteComment = (commentId) => {
  return httpClient.delete(`/comments/${commentId}`);
};

// Post reports
export const reportPost = (postId, reason) => {
  return httpClient.post(`/posts/${postId}/reports`, {
    reason
  });
};

// Group posts
export const getGroupPosts = (groupId, page = 1, perPage = 15) => {
  return httpClient.get(`/groups/${groupId}/posts`, {
    params: { page, per_page: perPage }
  });
};

// User posts
export const getUserPosts = (userId, page = 1, perPage = 15) => {
  return httpClient.get(`/users/${userId}/posts`, {
    params: { page, per_page: perPage }
  });
};

// User posts by pet
export const getUserPostsByPet = (userId, petId, page = 1, perPage = 15) => {
  return httpClient.get(`/users/${userId}/posts`, {
    params: { 
      page, 
      per_page: perPage,
      pet_id: petId
    }
  });
};

// Reply to comment
export const addReply = (postId, commentId, content) => {
  return httpClient.post(`/posts/${postId}/comments/${commentId}/replies`, {
    content
  });
};

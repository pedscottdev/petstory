import httpClient from './httpClient';

// Group CRUD operations
export const getGroups = (page = 1, perPage = 15) => {
  return httpClient.get('/groups', {
    params: { page, per_page: perPage }
  });
};

export const getGroupById = (groupId) => {
  return httpClient.get(`/groups/${groupId}`);
};

export const searchGroups = (query) => {
  return httpClient.get('/groups/search', {
    params: { query }
  });
};

export const createGroup = (groupData) => {
  // Convert to FormData if avatar is a File object
  if (groupData.avatar instanceof File) {
    const formData = new FormData();
    formData.append('name', groupData.name);
    formData.append('description', groupData.description || '');
    formData.append('category', groupData.category || '');
    formData.append('avatar', groupData.avatar);
    
    return httpClient.post('/groups', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  
  return httpClient.post('/groups', groupData);
};

export const updateGroup = (groupId, groupData) => {
  // Convert to FormData if avatar is a File object
  if (groupData.avatar instanceof File) {
    const formData = new FormData();
    formData.append('name', groupData.name);
    formData.append('description', groupData.description || '');
    formData.append('category', groupData.category || '');
    formData.append('avatar', groupData.avatar);
    formData.append('_method', 'PUT'); // Laravel method spoofing for file uploads
    
    return httpClient.post(`/groups/${groupId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  
  return httpClient.put(`/groups/${groupId}`, groupData);
};

export const deleteGroup = (groupId) => {
  return httpClient.delete(`/groups/${groupId}`);
};

// Group members
export const getGroupMembers = (groupId, limit = 50) => {
  return httpClient.get(`/groups/${groupId}/members`, {
    params: { limit }
  });
};

export const addGroupMember = (groupId, userId, role = 'member') => {
  return httpClient.post(`/groups/${groupId}/members`, {
    user_id: userId,
    role
  });
};

export const removeGroupMember = (groupId, userId) => {
  return httpClient.delete(`/groups/${groupId}/members/${userId}`);
};

export const changeMemberRole = (groupId, userId, role) => {
  return httpClient.put(`/groups/${groupId}/members/${userId}/role`, {
    role
  });
};

export const isMember = (groupId, userId) => {
  return httpClient.get(`/groups/${groupId}/is-member/${userId}`);
};

// Group posts
export const getGroupPosts = (groupId, page = 1, perPage = 15) => {
  return httpClient.get(`/groups/${groupId}/posts`, {
    params: { page, per_page: perPage }
  });
};

// User's groups
export const getUserGroups = (limit = 20) => {
  return httpClient.get('/users/groups', {
    params: { limit }
  });
};

export const getMyCreatedGroups = (limit = 20) => {
  return httpClient.get('/users/groups/created', {
    params: { limit }
  });
};

import httpClient from './httpClient';

// Conversation CRUD operations
export const getConversations = () => {
  return httpClient.get('/conversations');
};

export const getConversation = (conversationId) => {
  return httpClient.get(`/conversations/${conversationId}`);
};

export const createConversation = (data) => {
  // data: { is_group, user_ids, name?, description? }
  return httpClient.post('/conversations', data);
};

export const getOrCreateConversation = (userId) => {
  return httpClient.post('/conversations/get-or-create', { user_id: userId });
};

export const updateConversation = (conversationId, data) => {
  return httpClient.put(`/conversations/${conversationId}`, data);
};

export const deleteConversation = (conversationId) => {
  return httpClient.delete(`/conversations/${conversationId}`);
};

// Suggested users
export const getSuggestedUsers = () => {
  return httpClient.get('/conversations/suggestions');
};

// Messages
export const getMessages = (conversationId, page = 1, perPage = 50) => {
  return httpClient.get(`/conversations/${conversationId}/messages`, {
    params: { page, per_page: perPage }
  });
};

export const sendMessage = (messageData) => {
  // Check if messageData is already FormData (from chats/index.jsx)
  if (messageData instanceof FormData) {
    // If it's already FormData, send it directly
    return httpClient.post('/messages', messageData);
  }
  
  // Otherwise, create FormData from object
  const formData = new FormData();
  formData.append('conversation_id', messageData.conversation_id);
  
  if (messageData.content) {
    formData.append('content', messageData.content);
  }
  
  if (messageData.image instanceof File) {
    formData.append('image', messageData.image);
  }
  
  return httpClient.post('/messages', formData);
};

export const deleteMessage = (messageId) => {
  return httpClient.delete(`/messages/${messageId}`);
};

// Conversation members
export const getMembers = (conversationId) => {
  return httpClient.get(`/conversations/${conversationId}/members`);
};

export const addMember = (conversationId, userId) => {
  return httpClient.post(`/conversations/${conversationId}/members`, {
    user_id: userId
  });
};

export const removeMember = (conversationId, userId) => {
  return httpClient.delete(`/conversations/${conversationId}/members/${userId}`);
};

// Mark messages as read
export const markAsRead = (conversationId) => {
  return httpClient.post(`/conversations/${conversationId}/read`);
};

// Search conversations
export const searchConversations = (query) => {
  return httpClient.get('/conversations/search', {
    params: { query }
  });
};

// Search users (for creating new conversation)
export const searchUsers = (query) => {
  return httpClient.get('/users', {
    params: { search: query, per_page: 20 }
  });
};
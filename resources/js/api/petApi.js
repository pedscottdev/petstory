import httpClient from './httpClient';

// Pet CRUD operations
export const getPets = (page = 1, perPage = 15) => {
  return httpClient.get('/pets', {
    params: { page, per_page: perPage }
  });
};

export const getPetById = (petId) => {
  return httpClient.get(`/pets/${petId}`);
};

export const searchPets = (query) => {
  return httpClient.get('/pets/search', {
    params: { query }
  });
};

export const createPet = (petData) => {
  return httpClient.post('/pets', petData);
};

export const updatePet = (petId, petData) => {
  return httpClient.put(`/pets/${petId}`, petData);
};

export const deletePet = (petId) => {
  return httpClient.delete(`/pets/${petId}`);
};

// Pet likes
export const togglePetLike = (petId) => {
  return httpClient.post(`/pets/${petId}/toggle-like`);
};

export const getPetLikeCount = (petId) => {
  return httpClient.get(`/pets/${petId}/like-count`);
};

export const hasLikedPet = (petId) => {
  return httpClient.get(`/pets/${petId}/is-liked`);
};

// User's pets
export const getUserPets = (userId) => {
  return httpClient.get(`/users/${userId}/pets`, {
    params: { user_id: userId }
  });
};

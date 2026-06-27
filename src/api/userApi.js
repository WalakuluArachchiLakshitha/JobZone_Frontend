import { apiClient } from './apiClient';

export const userApi = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  changePassword: (data) => apiClient.put('/users/change-password', data),
  
  uploadAvatar: (formData) => apiClient.post('/users/upload-avatar', formData),
  uploadResumeFile: (formData) => apiClient.post('/users/upload-resume', formData),
  uploadCompanyBR: (formData) => apiClient.post('/users/upload-br', formData),
  
  getSeekers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/users/seekers?${query}`);
  },
  getSeekerById: (id) => apiClient.get(`/users/seekers/${id}`),
};

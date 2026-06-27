import { apiClient } from './apiClient';

export const adminApi = {
  getStats: () => apiClient.get('/admin/stats'),
  getAllUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/users?${query}`);
  },
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getPendingVerifications: () => apiClient.get('/admin/pending-verifications'),
  verifyCompany: (id) => apiClient.patch(`/admin/verify-company/${id}`),
  rejectVerification: (id) => apiClient.patch(`/admin/reject-verification/${id}`),
  getAllJobs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/jobs?${query}`);
  },
  adminDeleteJob: (id) => apiClient.delete(`/admin/jobs/${id}`),
  getContacts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/contacts?${query}`);
  },
};

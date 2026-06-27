import { apiClient } from './apiClient';

export const jobsApi = {
  getJobs: (params = {}) => {
    // Construct search params query string
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return apiClient.get(`/jobs${queryString ? `?${queryString}` : ''}`);
  },
  getJobById: (id) => apiClient.get(`/jobs/${id}`),
  createJob: (data) => apiClient.post('/jobs', data),
  updateJob: (id, data) => apiClient.put(`/jobs/${id}`, data),
  deleteJob: (id) => apiClient.delete(`/jobs/${id}`),
  getMyJobs: () => apiClient.get('/jobs/employer/my-jobs'),
};

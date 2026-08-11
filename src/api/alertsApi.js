import { apiClient } from './apiClient';

export const alertsApi = {
  createAlert: (data) => apiClient.post('/jobs/alerts', data),
  emailJob: (jobId, data) => apiClient.post(`/jobs/${jobId}/email`, data),
  contactEmployer: (jobId, data) => apiClient.post(`/jobs/${jobId}/contact`, data),
};


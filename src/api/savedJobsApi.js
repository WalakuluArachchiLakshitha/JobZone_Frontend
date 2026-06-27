import { apiClient } from './apiClient';

export const savedJobsApi = {
  saveJob: (jobId) => apiClient.post('/saved-jobs', { jobId }),
  getSavedJobs: () => apiClient.get('/saved-jobs'),
  unsaveJob: (jobId) => apiClient.delete(`/saved-jobs/${jobId}`),
};

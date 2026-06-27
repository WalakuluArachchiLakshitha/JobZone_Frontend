import { apiClient } from './apiClient';

export const applicationsApi = {
  apply: (jobId, coverLetter) => apiClient.post('/applications', { jobId, coverLetter }),
  getApplications: () => apiClient.get('/applications'),
  updateStatus: (id, status) => apiClient.patch(`/applications/${id}`, { status }),
};

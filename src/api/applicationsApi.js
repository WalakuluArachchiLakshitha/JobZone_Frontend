import { apiClient } from './apiClient';

export const applicationsApi = {
  apply: (jobId, coverLetter) => apiClient.post('/applications', { jobId, coverLetter }),
  getApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/applications?${query}`);
  },
  updateStatus: (id, status) => apiClient.patch(`/applications/${id}`, { status }),
};

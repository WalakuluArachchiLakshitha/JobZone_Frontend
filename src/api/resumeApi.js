import { apiClient } from './apiClient';

export const resumeApi = {
  getResume: () => apiClient.get('/resume'),
  updateResume: (data) => apiClient.put('/resume', data),
  generateCV: async () => {
    const token = localStorage.getItem('jobzone_token');
    const res = await fetch('http://localhost:5000/api/resume/generate-cv', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to generate CV');
    const blob = await res.blob();
    return blob;
  },
};

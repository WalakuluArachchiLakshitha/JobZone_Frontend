import { apiClient } from './apiClient';

export const contactApi = {
  submitContact: (data) => apiClient.post('/contact', data),
  getContactMessages: () => apiClient.get('/contact'),
};

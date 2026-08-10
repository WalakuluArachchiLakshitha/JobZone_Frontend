import { apiClient } from './apiClient';

export const companiesApi = {
  getCompanies: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return apiClient.get(`/companies${queryString ? `?${queryString}` : ''}`);
  },
  getCompanyById: (id) => apiClient.get(`/companies/${id}`),
  createCompany: (data) => apiClient.post('/companies', data),
  updateCompany: (id, data) => apiClient.put(`/companies/${id}`, data),
};





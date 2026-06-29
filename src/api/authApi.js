import { apiClient } from './apiClient';

export const authApi = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (data) => apiClient.post('/auth/register', data),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  verifyOtp: (email, otp) => apiClient.post('/auth/verify-otp', { email, otp }),
  resetPassword: (resetToken, newPassword) => apiClient.post('/auth/reset-password', { resetToken, newPassword }),
  googleLogin: (credential) => apiClient.post('/auth/google', { credential }),
};

import { apiClient } from './apiClient';

export const chatbotApi = {
  sendMessage: (message) => apiClient.post('/chatbot/message', { message }),
};

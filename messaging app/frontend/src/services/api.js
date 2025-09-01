import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials) {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await this.client.put('/auth/profile', profileData);
    return response.data;
  }

  // Conversation endpoints
  async getConversations() {
    const response = await this.client.get('/conversations');
    return response.data;
  }

  async searchUsers(query) {
    console.log('API searchUsers called with query:', query);
    const response = await this.client.get('/conversations/search-users', {
      params: { query }
    });
    console.log('API searchUsers response:', response.data);
    return response.data;
  }

  async getConversation(id) {
    const response = await this.client.get(`/conversations/${id}`);
    return response.data;
  }

  async createConversation(conversationData) {
    const response = await this.client.post('/conversations', conversationData);
    return response.data;
  }

  async getMessages(conversationId, page = 1, limit = 50) {
    const response = await this.client.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  }

  async leaveConversation(conversationId) {
    const response = await this.client.post(`/conversations/${conversationId}/leave`);
    return response.data;
  }

  // Message endpoints
  async sendMessage(messageData) {
    const response = await this.client.post('/messages', messageData);
    return response.data;
  }

  async editMessage(messageId, content) {
    const response = await this.client.put(`/messages/${messageId}`, { content });
    return response.data;
  }

  async deleteMessage(messageId) {
    const response = await this.client.delete(`/messages/${messageId}`);
    return response.data;
  }

  async addReaction(messageId, reaction) {
    const response = await this.client.post(`/messages/${messageId}/reactions`, { reaction });
    return response.data;
  }

  async removeReaction(messageId, reaction) {
    const response = await this.client.delete(`/messages/${messageId}/reactions/${reaction}`);
    return response.data;
  }

  async markMessagesAsRead(messageIds) {
    const response = await this.client.post('/messages/read', { messageIds });
    return response.data;
  }

  async searchMessages(query, conversationId = null, limit = 20) {
    const response = await this.client.get('/messages/search', {
      params: { query, conversationId, limit }
    });
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export default new ApiClient();
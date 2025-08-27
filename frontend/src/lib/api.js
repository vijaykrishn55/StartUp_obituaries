import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
}

// Users API
export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
}

// Startups API
export const startupsAPI = {
  getFeatured: () => api.get('/startups/featured'),
  getStartups: (params) => api.get('/startups', { params }),
  createStartup: (startupData) => api.post('/startups', startupData),
  getStartup: (id) => api.get(`/startups/${id}`),
  updateStartup: (id, startupData) => api.put(`/startups/${id}`, startupData),
  deleteStartup: (id) => api.delete(`/startups/${id}`),
}

// Reactions API
export const reactionsAPI = {
  getReactions: (startupId) => api.get(`/startups/${startupId}/reactions`),
  addReaction: (startupId, type) => api.post(`/startups/${startupId}/reaction`, { type }),
  removeReaction: (startupId, type) => api.delete(`/startups/${startupId}/reaction`, { data: { type } }),
}

// Comments API
export const commentsAPI = {
  getComments: (startupId) => api.get(`/startups/${startupId}/comments`),
  createComment: (startupId, content, parentId = null) => 
    api.post(`/startups/${startupId}/comments`, { content, parent_comment_id: parentId }),
  updateComment: (commentId, content) => api.put(`/comments/${commentId}`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
}

// Connections API
export const connectionsAPI = {
  getConnections: () => api.get('/connections'),
  getConnectionRequests: () => api.get('/connections/requests'),
  sendConnectionRequest: (userId, message) => api.post(`/connections/connect/${userId}`, { message }),
  respondToRequest: (requestId, status) => api.put(`/connections/${requestId}`, { status }),
}

// Messages API
export const messagesAPI = {
  getMessages: (connectionId) => api.get(`/messages/${connectionId}`),
  sendMessage: (connectionId, content) => api.post('/messages', { connection_id: connectionId, content }),
}

// Leaderboards API
export const leaderboardsAPI = {
  getMostTragic: () => api.get('/leaderboards/most-tragic'),
  getDeservedPivot: () => api.get('/leaderboards/deserved-pivot'),
  getBrilliantMistakes: () => api.get('/leaderboards/brilliant-mistakes'),
  getMostFundedFailures: () => api.get('/leaderboards/most-funded-failures'),
  getMostDownvoted: () => api.get('/leaderboards/most-downvoted'),
  getMostUpvoted: () => api.get('/leaderboards/most-upvoted'),
}

// Team API
export const teamAPI = {
  getTeamMembers: (startupId) => api.get(`/startups/${startupId}/team`),
  requestToJoin: (startupId, requestData) => api.post(`/startups/${startupId}/join-requests`, requestData),
  getJoinRequests: (startupId) => api.get(`/startups/${startupId}/join-requests`),
  respondToJoinRequest: (requestId, status) => api.put(`/join-requests/${requestId}`, { status }),
  removeTeamMember: (memberId) => api.delete(`/team/${memberId}`),
}

export default api

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
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

// Users API
export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
}

// Startups API
export const startupsAPI = {
  getStartups: (params = {}) => api.get('/startups', { params }),
  getStartup: (id) => api.get(`/startups/${id}`),
  createStartup: (startupData) => api.post('/startups', startupData),
  updateStartup: (id, startupData) => api.put(`/startups/${id}`, startupData),
  deleteStartup: (id) => api.delete(`/startups/${id}`),
  uploadLogo: (id, formData) => api.post(`/startups/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteLogo: (id) => api.delete(`/startups/${id}/logo`),
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
  getMessages: (connectionId, params = {}) => 
    api.get(`/messages/${connectionId}`, { params }),
  
  sendMessage: (connectionId, content) =>
    api.post('/messages', { connection_id: connectionId, content })
}

export const statsAPI = {
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
  getLeaderboard: () => api.get('/stats/leaderboard')
}

export const adminAPI = {
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getStats: () => api.get('/admin/stats'),
  getContent: (params = {}) => api.get('/admin/content', { params })
}

export const reportsAPI = {
  createReport: (reportData) => api.post('/reports', reportData),
  getReports: (params = {}) => api.get('/reports', { params }),
  updateReportStatus: (reportId, data) => api.put(`/reports/${reportId}/status`, data)
}

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getUserGrowth: () => api.get('/analytics/user-growth'),
  getStartupTrends: () => api.get('/analytics/startup-trends'),
  getFailureReasons: () => api.get('/analytics/failure-reasons'),
  getIndustryBreakdown: () => api.get('/analytics/industry-breakdown'),
  getEngagement: () => api.get('/analytics/engagement'),
  getFunding: () => api.get('/analytics/funding'),
  getUserRoles: () => api.get('/analytics/user-roles')
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

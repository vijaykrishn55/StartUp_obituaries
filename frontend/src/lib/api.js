import axios from 'axios'
import { getIdToken } from 'firebase/auth'
import { auth } from '../config/firebase'

const API_BASE_URL = 'http://localhost:3000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add Firebase auth token to requests
api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    try {
      const token = await getIdToken(auth.currentUser)
      config.headers.Authorization = `Bearer ${token}`
    } catch (error) {
      console.error('Failed to get Firebase token:', error)
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Firebase auth will handle redirect
      console.error('Authentication error:', error)
    }
    return Promise.reject(error)
  }
)

// Auth API (Firebase-based)
export const authAPI = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  register: (userData) => api.post('/auth/register', userData),
  
  // If your backend doesn't have a /auth/me endpoint, 
  // we'll use the Firebase user info and local storage as a fallback
  getProfileFallback: async () => {
    // This is a fallback method when backend doesn't support Firebase auth yet
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    
    // Check if we have cached user data
    const cachedProfile = localStorage.getItem(`user_profile_${user.uid}`);
    if (cachedProfile) {
      return { data: { user: JSON.parse(cachedProfile) } };
    }
    
    // If no cached data, return a minimal profile based on Firebase user
    const minimalProfile = {
      id: user.uid,
      email: user.email,
      username: user.displayName || user.email.split('@')[0],
      first_name: user.displayName ? user.displayName.split(' ')[0] : '',
      last_name: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
      photo_url: user.photoURL || '',
      firebase_user: true
    };
    
    // Cache this minimal profile
    localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(minimalProfile));
    return { data: { user: minimalProfile } };
  }
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
  getFeatured: () => api.get('/startups/featured'),
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

// Conversations API
export const conversationsAPI = {
  getConversations: () => api.get('/conversations'),
  getConversation: (conversationId) => api.get(`/conversations/${conversationId}`),
  createConversation: (otherUserId) => api.post('/conversations', { otherUserId }),
}

// Messages API
export const messagesAPI = {
  getMessages: (conversationId, params = {}) => 
    api.get(`/messages/${conversationId}`, { params }),
  editMessage: (messageId, content) => api.put(`/messages/${messageId}`, { content }),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  addReaction: (messageId, reaction) => api.post(`/messages/${messageId}/reactions`, { reaction }),
  removeReaction: (messageId, reaction) => api.delete(`/messages/${messageId}/reactions/${reaction}`),
  // Note: Message sending is now handled via Socket.IO real-time events
  // Use socket.emit('send_message', { conversationId, content }) instead
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

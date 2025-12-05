// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API fetch wrapper with error handling
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

// API Methods
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    userType: string;
  }) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch('/auth/logout', {
      method: 'POST',
    }),

  refreshToken: () =>
    apiFetch('/auth/refresh-token', {
      method: 'POST',
    }),

  forgotPassword: (email: string) =>
    apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  getCurrentUser: () => apiFetch('/auth/me'),

  // Stories
  getStories: (params?: { category?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiFetch(`/stories?${query}`);
  },

  getStoryById: (id: string) => apiFetch(`/stories/${id}`),

  createStory: (data: any) =>
    apiFetch('/stories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStory: (id: string, data: any) =>
    apiFetch(`/stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteStory: (id: string) =>
    apiFetch(`/stories/${id}`, {
      method: 'DELETE',
    }),

  likeStory: (id: string) =>
    apiFetch(`/stories/${id}/like`, {
      method: 'POST',
    }),

  // Founders
  getFounders: (params?: { search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiFetch(`/founders?${query}`);
  },

  getFounderById: (id: string) => apiFetch(`/founders/${id}`),

  createFounderProfile: (data: any) =>
    apiFetch('/founders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFounderProfile: (id: string, data: any) =>
    apiFetch(`/founders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteFounderProfile: (id: string) =>
    apiFetch(`/founders/${id}`, {
      method: 'DELETE',
    }),

  // Investors
  getInvestors: (params?: { search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiFetch(`/investors?${query}`);
  },

  getInvestorById: (id: string) => apiFetch(`/investors/${id}`),

  createInvestorProfile: (data: any) =>
    apiFetch('/investors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateInvestorProfile: (id: string, data: any) =>
    apiFetch(`/investors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteInvestorProfile: (id: string) =>
    apiFetch(`/investors/${id}`, {
      method: 'DELETE',
    }),

  // Jobs
  getJobs: (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiFetch(`/jobs?${query}`);
  },

  getJobById: (id: string) => apiFetch(`/jobs/${id}`),

  createJob: (data: any) =>
    apiFetch('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  applyToJob: (jobId: string, data: any) =>
    apiFetch(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateJob: (jobId: string, data: any) =>
    apiFetch(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteJob: (jobId: string) =>
    apiFetch(`/jobs/${jobId}`, {
      method: 'DELETE',
    }),

  getJobApplications: (jobId: string) => apiFetch(`/jobs/${jobId}/applications`),

  getMyJobApplications: () => apiFetch('/jobs/my-applications'),

  getMyJobPostings: () => apiFetch('/jobs/my-postings'),

  // Posts
  getPosts: (params?: { page?: number; limit?: number; type?: string; author?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.type) query.append('type', params.type);
    if (params?.author) query.append('author', params.author);
    return apiFetch(`/posts?${query}`);
  },

  getPostById: (id: string) => apiFetch(`/posts/${id}`),

  getTrendingPosts: (limit?: number) => {
    const query = new URLSearchParams();
    if (limit) query.append('limit', limit.toString());
    return apiFetch(`/posts/trending?${query}`);
  },

  getUserPosts: (userId: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiFetch(`/posts/user/${userId}?${query}`);
  },

  getBookmarkedPosts: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiFetch(`/posts/bookmarked?${query}`);
  },

  createPost: (data: any) =>
    apiFetch('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePost: (id: string, data: any) =>
    apiFetch(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePost: (id: string) =>
    apiFetch(`/posts/${id}`, {
      method: 'DELETE',
    }),

  likePost: (id: string) =>
    apiFetch(`/posts/${id}/like`, {
      method: 'POST',
    }),

  bookmarkPost: (id: string) =>
    apiFetch(`/posts/${id}/bookmark`, {
      method: 'POST',
    }),

  getPostComments: (id: string) => apiFetch(`/posts/${id}/comments`),

  commentOnPost: (id: string, content: string) =>
    apiFetch(`/posts/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  votePoll: (postId: string, optionIndex: number) =>
    apiFetch(`/posts/${postId}/poll/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionIndex }),
    }),

  // Profile
  getProfile: (userId?: string) => {
    const endpoint = userId ? `/users/${userId}` : '/users/me';
    return apiFetch(endpoint);
  },

  getProfileAnalytics: () => apiFetch('/users/me/analytics'),

  updateProfile: (data: any) =>
    apiFetch('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });
    if (!response.ok) throw new Error('Avatar upload failed');
    return await response.json();
  },

  addExperience: (data: any) =>
    apiFetch('/users/me/experience', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateExperience: (expId: string, data: any) =>
    apiFetch(`/users/me/experience/${expId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteExperience: (expId: string) =>
    apiFetch(`/users/me/experience/${expId}`, {
      method: 'DELETE',
    }),

  addEducation: (data: any) =>
    apiFetch('/users/me/education', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteEducation: (eduId: string) =>
    apiFetch(`/users/me/education/${eduId}`, {
      method: 'DELETE',
    }),

  addSkill: (data: any) =>
    apiFetch('/users/me/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteSkill: (skillId: string) =>
    apiFetch(`/users/me/skills/${skillId}`, {
      method: 'DELETE',
    }),

  addVenture: (data: any) =>
    apiFetch('/users/me/ventures', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteVenture: (ventureId: string) =>
    apiFetch(`/users/me/ventures/${ventureId}`, {
      method: 'DELETE',
    }),

  getConnectionsCount: (userId?: string) => {
    const endpoint = userId ? `/users/${userId}/connections-count` : '/users/me/connections-count';
    return apiFetch(endpoint);
  },

  // Notifications
  getNotifications: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiFetch(`/notifications?${query}`);
  },

  getUnreadNotifications: () => apiFetch('/notifications?unreadOnly=true'),

  markNotificationAsRead: (id: string) =>
    apiFetch(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsAsRead: () =>
    apiFetch('/notifications/read-all', {
      method: 'PUT',
    }),

  deleteNotification: (id: string) =>
    apiFetch(`/notifications/${id}`, {
      method: 'DELETE',
    }),

  // Connections
  getConnections: () => apiFetch('/connections'),

  getSentConnectionRequests: () => apiFetch('/connections?type=sent'),

  getReceivedConnectionRequests: () => apiFetch('/connections/requests'),

  getConnectionSuggestions: (limit?: number) => {
    const query = new URLSearchParams();
    if (limit) query.append('limit', limit.toString());
    return apiFetch(`/connections/suggestions?${query}`);
  },

  sendConnectionRequest: (userId: string) =>
    apiFetch('/connections/request', {
      method: 'POST',
      body: JSON.stringify({ recipientId: userId }),
    }),

  acceptConnectionRequest: (requestId: string) =>
    apiFetch(`/connections/accept/${requestId}`, {
      method: 'POST',
    }),

  rejectConnectionRequest: (requestId: string) =>
    apiFetch(`/connections/reject/${requestId}`, {
      method: 'POST',
    }),

  removeConnection: (connectionId: string) =>
    apiFetch(`/connections/${connectionId}`, {
      method: 'DELETE',
    }),

  // Messages
  getConversations: () => apiFetch('/messages/conversations'),

  getConversation: (conversationId: string) =>
    apiFetch(`/messages/conversations/${conversationId}`),

  getMessages: (conversationId: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiFetch(`/messages/conversations/${conversationId}/messages?${query}`);
  },

  sendMessage: (conversationId: string, content: string) =>
    apiFetch(`/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  createConversation: (participantId: string) =>
    apiFetch('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    }),

  markConversationAsRead: (conversationId: string) =>
    apiFetch(`/messages/conversations/${conversationId}/read`, {
      method: 'PUT',
    }),

  deleteMessage: (conversationId: string, messageId: string) =>
    apiFetch(`/messages/conversations/${conversationId}/messages/${messageId}`, {
      method: 'DELETE',
    }),

  // Upload
  uploadFile: async (file: File, type: 'avatar' | 'cover' | 'document') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  },

  // Pitches
  createPitch: (data: any) =>
    apiFetch('/pitches', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPitches: (params?: { page?: number; limit?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    return apiFetch(`/pitches?${query}`);
  },

  getPitchById: (id: string) => apiFetch(`/pitches/${id}`),

  updatePitch: (id: string, data: any) =>
    apiFetch(`/pitches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePitch: (id: string) =>
    apiFetch(`/pitches/${id}`, {
      method: 'DELETE',
    }),

  updatePitchStatus: (id: string, status: string, feedback?: string) =>
    apiFetch(`/pitches/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, feedback }),
    }),

  getMyPitches: () => apiFetch('/pitches/my-pitches'),

  getReceivedPitches: () => apiFetch('/pitches/received'),

  // Comments
  getCommentById: (id: string) => apiFetch(`/comments/${id}`),

  updateComment: (id: string, content: string) =>
    apiFetch(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  deleteComment: (id: string) =>
    apiFetch(`/comments/${id}`, {
      method: 'DELETE',
    }),

  likeComment: (id: string) =>
    apiFetch(`/comments/${id}/like`, {
      method: 'POST',
    }),

  replyToComment: (id: string, content: string) =>
    apiFetch(`/comments/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getCommentReplies: (id: string) => apiFetch(`/comments/${id}/replies`),

  // Applications
  getApplicationById: (id: string) => apiFetch(`/applications/${id}`),

  updateApplicationStatus: (id: string, status: string, notes?: string) =>
    apiFetch(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),

  withdrawApplication: (id: string) =>
    apiFetch(`/applications/${id}/withdraw`, {
      method: 'POST',
    }),

  // Search
  globalSearch: (query: string, params?: { type?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    return apiFetch(`/search?${searchParams}`);
  },

  searchUsers: (query: string, params?: { userType?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (params?.userType) searchParams.append('userType', params.userType);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    return apiFetch(`/search/users?${searchParams}`);
  },

  // Mutual Connections
  getMutualConnections: (userId: string) => apiFetch(`/connections/mutual/${userId}`),

  // Unread notification count
  getUnreadNotificationCount: () => apiFetch('/notifications/unread-count'),

  // Upload deletion
  deleteUploadedFile: (fileId: string) =>
    apiFetch(`/upload/${fileId}`, {
      method: 'DELETE',
    }),

  // Failure Reports (Failure Heatmap)
  getFailureReports: (params?: { 
    industry?: string; 
    reason?: string; 
    country?: string; 
    page?: number; 
    limit?: number 
  }) => {
    const query = new URLSearchParams();
    if (params?.industry) query.append('industry', params.industry);
    if (params?.reason) query.append('reason', params.reason);
    if (params?.country) query.append('country', params.country);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiFetch(`/failure-reports?${query}`);
  },

  getFailureReportById: (id: string) => apiFetch(`/failure-reports/${id}`),

  createFailureReport: (data: any) =>
    apiFetch('/failure-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHeatmapData: (params?: { industry?: string; reason?: string }) => {
    const query = new URLSearchParams();
    if (params?.industry) query.append('industry', params.industry);
    if (params?.reason) query.append('reason', params.reason);
    return apiFetch(`/failure-reports/heatmap?${query}`);
  },

  getFailureAnalytics: () => apiFetch('/failure-reports/analytics'),

  addFailureComment: (id: string, text: string) =>
    apiFetch(`/failure-reports/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  markFailureHelpful: (id: string) =>
    apiFetch(`/failure-reports/${id}/helpful`, {
      method: 'POST',
    }),

  // Assets (Resurrection Marketplace)
  getAssets: (params?: { 
    category?: string; 
    minPrice?: number; 
    maxPrice?: number; 
    search?: string;
    page?: number; 
    limit?: number 
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.minPrice) query.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) query.append('maxPrice', params.maxPrice.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiFetch(`/assets?${query}`);
  },

  getAssetById: (id: string) => apiFetch(`/assets/${id}`),

  createAsset: (data: any) =>
    apiFetch('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAsset: (id: string, data: any) =>
    apiFetch(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAsset: (id: string) =>
    apiFetch(`/assets/${id}`, {
      method: 'DELETE',
    }),

  expressInterest: (id: string, message: string, offer?: number) =>
    apiFetch(`/assets/${id}/interest`, {
      method: 'POST',
      body: JSON.stringify({ message, offer }),
    }),

  markAssetSold: (id: string, buyerId: string, soldPrice: number) =>
    apiFetch(`/assets/${id}/sold`, {
      method: 'POST',
      body: JSON.stringify({ buyerId, soldPrice }),
    }),

  getMarketplaceStats: () => apiFetch('/assets/stats'),

  getMyAssets: () => apiFetch('/assets/my-assets'),

  // War Rooms (Live Autopsy War Rooms)
  getWarRooms: (params?: { 
    status?: string; 
    situation?: string; 
    isLive?: boolean;
    page?: number; 
    limit?: number 
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.situation) query.append('situation', params.situation);
    if (params?.isLive !== undefined) query.append('isLive', params.isLive.toString());
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiFetch(`/war-rooms?${query}`);
  },

  getWarRoomById: (id: string) => apiFetch(`/war-rooms/${id}`),

  createWarRoom: (data: any) =>
    apiFetch('/war-rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  joinWarRoom: (id: string, role?: string) =>
    apiFetch(`/war-rooms/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  sendWarRoomMessage: (id: string, text: string, type?: string) =>
    apiFetch(`/war-rooms/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, type }),
    }),

  reactToWarRoomMessage: (id: string, messageId: string, emoji: string) =>
    apiFetch(`/war-rooms/${id}/messages/${messageId}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),

  addWarRoomAction: (id: string, description: string, assignedTo?: string) =>
    apiFetch(`/war-rooms/${id}/actions`, {
      method: 'POST',
      body: JSON.stringify({ description, assignedTo }),
    }),

  updateWarRoomAction: (id: string, actionId: string, status: string) =>
    apiFetch(`/war-rooms/${id}/actions/${actionId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  addWarRoomResource: (id: string, data: any) =>
    apiFetch(`/war-rooms/${id}/resources`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createWarRoomPoll: (id: string, question: string, options: string[]) =>
    apiFetch(`/war-rooms/${id}/polls`, {
      method: 'POST',
      body: JSON.stringify({ question, options }),
    }),

  voteWarRoomPoll: (id: string, pollId: string, option: number) =>
    apiFetch(`/war-rooms/${id}/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ option }),
    }),

  addMentorNote: (id: string, note: string, isPrivate?: boolean) =>
    apiFetch(`/war-rooms/${id}/mentor-notes`, {
      method: 'POST',
      body: JSON.stringify({ note, isPrivate }),
    }),

  endWarRoom: (id: string, outcome: any, summary: string) =>
    apiFetch(`/war-rooms/${id}/end`, {
      method: 'POST',
      body: JSON.stringify({ outcome, summary }),
    }),
};

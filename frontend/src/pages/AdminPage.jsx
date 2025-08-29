import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'content') {
      loadContent();
    }
  }, [activeTab, searchQuery, roleFilter, pagination.page]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        adminAPI.getUsers({ page: 1, limit: 20 }),
        adminAPI.getStats()
      ]);
      
      setUsers(usersResponse.data.users);
      setPagination(usersResponse.data.pagination);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        role: roleFilter
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadContent = async () => {
    try {
      const response = await adminAPI.getContent({
        page: pagination.page,
        limit: pagination.limit
      });
      setContent(response.data);
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await adminAPI.updateUser(userId, updates);
      loadUsers(); // Refresh users list
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      loadUsers(); // Refresh users list
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading admin panel..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Manage users, content, and platform statistics</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.platform_stats.total_users}</p>
                <p className="text-xs text-green-600">+{stats.platform_stats.new_users_30d} this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Startups</p>
                <p className="text-2xl font-bold text-gray-900">{stats.platform_stats.total_startups}</p>
                <p className="text-xs text-green-600">+{stats.platform_stats.new_startups_30d} this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.platform_stats.total_comments}</p>
                <p className="text-xs text-green-600">+{stats.platform_stats.new_comments_30d} this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.platform_stats.total_connections}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', name: 'Users', icon: UsersIcon },
            { id: 'content', name: 'Content', icon: DocumentTextIcon },
            { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow">
          {/* Search and Filter */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 input"
                />
              </div>
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10 input"
                >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="founder">Founder</option>
                  <option value="investor">Investor</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.user_role}
                        onChange={(e) => handleUpdateUser(user.id, { user_role: e.target.value })}
                        className="text-sm border-gray-300 rounded-md"
                      >
                        <option value="student">Student</option>
                        <option value="founder">Founder</option>
                        <option value="investor">Investor</option>
                        <option value="recruiter">Recruiter</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>{user.stats.startups} startups</div>
                        <div>{user.stats.comments} comments</div>
                        <div>{user.stats.connections} connections</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {content.startups && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Startups</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {content.startups.map((startup) => (
                  <div key={startup.id} className="p-6">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{startup.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{startup.description}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span>By {startup.first_name} {startup.last_name}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(startup.created_at)}</span>
                          <span className="mx-2">•</span>
                          <span>{startup.reaction_count} reactions</span>
                          <span className="mx-2">•</span>
                          <span>{startup.comment_count} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.comments && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Comments</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {content.comments.map((comment) => (
                  <div key={comment.id} className="p-6">
                    <p className="text-gray-900">{comment.content}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span>By {comment.first_name} {comment.last_name}</span>
                      <span className="mx-2">•</span>
                      <span>on {comment.startup_name}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Role Distribution</h3>
            <div className="space-y-3">
              {stats.role_distribution.map((role) => (
                <div key={role.user_role} className="flex justify-between items-center">
                  <span className="capitalize font-medium">{role.user_role}</span>
                  <span className="text-gray-600">{role.count} users</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Most Active Users</h3>
            <div className="space-y-3">
              {stats.most_active_users.map((user, index) => (
                <div key={user.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">#{index + 1} {user.first_name} {user.last_name}</span>
                    <span className="text-gray-500 ml-2">@{user.username}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {parseInt(user.startup_count) + parseInt(user.comment_count) + parseInt(user.reaction_count)} activities
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  UserCircleIcon,
  PencilIcon,
  MapPinIcon,
  LinkIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { usersAPI, connectionsAPI, authAPI, statsAPI, startupsAPI } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import { cn } from '../lib/utils'

export default function ProfilePage() {
  const { userId } = useParams()
  const { user: currentUser } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [startups, setStartups] = useState([])
  const [userStats, setUserStats] = useState({
    totalReactions: 0,
    commentsMade: 0,
    connectionsCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [connectionStatus, setConnectionStatus] = useState('none')
  const targetUserId = userId || currentUser?.id
  const isOwnProfile = !userId || (currentUser && parseInt(userId) === currentUser.id)

  useEffect(() => {
    if (targetUserId) {
      loadProfile()
    }
  }, [userId, currentUser?.id])

  const loadProfile = async () => {
    try {
      setLoading(true);
      let profileData;
      if (isOwnProfile) {
        const [profileResponse, startupsResponse] = await Promise.all([
          authAPI.getProfile(),
          startupsAPI.getStartups({ userId: targetUserId })
        ]);
        profileData = profileResponse.data.user;
        profileData.startups = startupsResponse.data.startups || startupsResponse.data || [];
        // Get actual stats for own profile
        try {
          const statsResponse = await statsAPI.getUserStats(targetUserId);
          setUserStats(statsResponse.data.stats);
        } catch (statsError) {
          console.error('Failed to load own stats:', statsError);
          setUserStats({
            total_reactions_received: 0,
            comments_made: 0,
            connections_count: 0,
            startups_count: profileData.startups.length
          });
        }
      } else {
        const [profileResponse, statsResponse] = await Promise.all([
          usersAPI.getUserProfile(targetUserId),
          statsAPI.getUserStats(targetUserId)
        ]);
        profileData = profileResponse.data;
        if (profileData.user) {
          profileData = { ...profileData.user, startups: profileData.startups || [] };
        }
        setUserStats(statsResponse.data.stats);
        
        try {
          const connectionsResponse = await connectionsAPI.getConnections();
          const connections = connectionsResponse.data.connections || connectionsResponse.data || [];
          const existingConnection = connections.find(conn => 
            conn.sender_user_id === parseInt(targetUserId) || 
            conn.receiver_user_id === parseInt(targetUserId)
          );
          if (existingConnection) {
            setConnectionStatus(existingConnection.status === 'accepted' ? 'connected' : 'pending');
          } else {
            setConnectionStatus('none');
          }
        } catch (connError) {
          console.error('Failed to load connection status:', connError);
          setConnectionStatus('none');
        }
      }
      setProfile(profileData);
      setStartups(profileData.startups || []);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  const handleEditProfile = async (e) => {
    e.preventDefault()
    try {
      console.log('Sending profile update data:', editData)
      await usersAPI.updateProfile(editData)
      setProfile(prev => ({ ...prev, ...editData }))
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
    }
  }

  const handleConnect = async () => {
    try {
      if (connectionStatus !== 'none') {
        return; // Prevent duplicate requests
      }
      
      setConnectionStatus('pending'); // Optimistic update
      await connectionsAPI.sendConnectionRequest(targetUserId, 'I would like to connect with you!')
    } catch (error) {
      console.error('Failed to send connection request:', error)
      setConnectionStatus('none'); // Revert on error
      
      // Show user-friendly error
      if (error.response?.status === 409) {
        alert(error.response.data.error || 'Connection request already exists');
      } else {
        alert('Failed to send connection request. Please try again.');
      }
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading profile..." />
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <UserCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
        <p className="text-gray-600">The user profile you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <UserCircleIcon className="h-24 w-24 text-gray-400" />
              {profile.open_to_work && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Open to work
                </div>
              )}
              {profile.open_to_co_founding && (
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Co-founding
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </h1>
                {profile.is_recruiter && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                    Recruiter
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </div>
                
                {profile.linkedin_url && (
                  <a 
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    LinkedIn
                  </a>
                )}
                
                {profile.github_url && (
                  <a 
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-700"
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isOwnProfile ? (
              <button
                onClick={() => {
                  setIsEditing(true)
                  setEditData({
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || '',
                    bio: profile.bio || '',
                    linkedin_url: profile.linkedin_url || '',
                    github_url: profile.github_url || '',
                    open_to_work: Boolean(profile.open_to_work),
                    open_to_co_founding: Boolean(profile.open_to_co_founding)
                  })
                }}
                className="btn-outline flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit Profile
              </button>
            ) : (
              <>
                {connectionStatus === 'none' && (
                  <button
                    onClick={handleConnect}
                    className="btn-primary flex items-center"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-1" />
                    Connect
                  </button>
                )}
                
                {connectionStatus === 'pending' && (
                  <button disabled className="btn-outline opacity-50">
                    Request Sent
                  </button>
                )}
                
                {connectionStatus === 'connected' && (
                  <Link to="/messages" className="btn-outline flex items-center">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                    Message
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h2>
            
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editData.first_name || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editData.last_name || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={editData.bio || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  className="input"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={editData.linkedin_url || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={editData.github_url || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, github_url: e.target.value }))}
                  className="input"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editData.open_to_work || false}
                    onChange={(e) => setEditData(prev => ({ ...prev, open_to_work: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-900">Open to work</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editData.open_to_co_founding || false}
                    onChange={(e) => setEditData(prev => ({ ...prev, open_to_co_founding: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-900">Open to co-founding</label>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Startup History */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Startup History ({startups.length})
            </h2>
            
            {startups.length === 0 ? (
              <div className="text-center py-8">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No startups yet</h3>
                <p className="text-gray-600">
                  {isOwnProfile ? 'Share your first startup story!' : 'No startup stories shared yet.'}
                </p>
                {isOwnProfile && (
                  <Link to="/create" className="btn-primary mt-4">
                    Share Your Story
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {startups.map((startup) => (
                  <Link
                    key={startup.id}
                    to={`/startup/${startup.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{startup.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{startup.industry}</p>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {startup.description}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{startup.founded_year} - {startup.died_year}</div>
                        <div className="mt-1">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                            {startup.primary_failure_reason}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Startups Shared</span>
                <span className="font-medium">{startups.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Reactions</span>
                <span className="font-medium">{userStats.total_reactions_received}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Comments Made</span>
                <span className="font-medium">{userStats.comments_made}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Connections</span>
                <span className="font-medium">{userStats.connections_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Networking Status */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Networking</h3>
            <div className="space-y-3">
              {profile.open_to_work && (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Open to work opportunities</span>
                </div>
              )}
              
              {profile.open_to_co_founding && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Open to co-founding</span>
                </div>
              )}
              
              {profile.is_recruiter && (
                <div className="flex items-center space-x-2 text-purple-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">Recruiter</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          {!isOwnProfile && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Get in Touch</h3>
              <div className="space-y-3">
                <button
                  onClick={handleConnect}
                  disabled={connectionStatus !== 'none'}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {connectionStatus === 'none' && 'Send Connection Request'}
                  {connectionStatus === 'pending' && 'Request Sent'}
                  {connectionStatus === 'connected' && 'Connected'}
                </button>
                
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-outline text-center block"
                  >
                    View LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  UsersIcon,
  UserPlusIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'
import { connectionsAPI, usersAPI } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import { cn } from '../lib/utils'

const tabs = [
  { id: 'connections', name: 'My Connections', icon: UsersIcon },
  { id: 'requests', name: 'Requests', icon: UserPlusIcon },
  { id: 'discover', name: 'Discover People', icon: MagnifyingGlassIcon },
]

export default function ConnectionsPage() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('connections')
  const [connections, setConnections] = useState([])
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'connections':
          const connectionsResponse = await connectionsAPI.getConnections()
          const allConnections = connectionsResponse.data.connections || connectionsResponse.data || []
          // Filter out connections where both users are the same (shouldn't happen but safety check)
          // and only show accepted connections
          const validConnections = allConnections.filter(conn => 
            conn.status === 'accepted' && 
            conn.sender_user_id !== conn.receiver_user_id
          )
          setConnections(validConnections)
          break
        case 'requests':
          const requestsResponse = await connectionsAPI.getConnectionRequests()
          setRequests(requestsResponse.data.requests || requestsResponse.data || [])
          break
        case 'discover':
          const usersResponse = await usersAPI.getUsers()
          setUsers(usersResponse.data.users || usersResponse.data || [])
          break
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectionRequest = async (userId, message = '') => {
    try {
      await connectionsAPI.sendConnectionRequest(userId, message)
      // Remove user from discover list or update UI
      setUsers(prev => prev.filter(user => user.id !== userId))
      
      // Show success message
      alert('Connection request sent successfully!')
    } catch (error) {
      console.error('Failed to send connection request:', error)
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        const errorMessage = error.response.data.error || 'Connection already exists'
        alert(errorMessage)
      } else if (error.response?.status === 400 && error.response.data.error === 'Cannot connect to yourself') {
        alert('You cannot send a connection request to yourself')
      } else {
        alert('Failed to send connection request. Please try again.')
      }
    }
  }

  const handleRequestResponse = async (requestId, status) => {
    try {
      await connectionsAPI.respondToRequest(requestId, status)
      setRequests(prev => prev.filter(request => request.id !== requestId))
      
      if (status === 'accepted') {
        // Reload connections to show the new connection
        if (activeTab === 'connections') {
          loadData()
        }
      }
    } catch (error) {
      console.error('Failed to respond to request:', error)
    }
  }

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`)
  }

  const handleMessage = (connection) => {
    // Get the other user's ID from the connection
    const otherUserId = connection.sender_user_id === currentUser?.id 
      ? connection.receiver_user_id 
      : connection.sender_user_id
    
    navigate('/messages', { state: { connectionId: connection.id, otherUserId } })
  }

  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderConnections = () => (
    <div className="space-y-4">
      {connections.length === 0 ? (
        <div className="text-center py-12">
          <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
          <p className="text-gray-600 mb-4">Start building your network by connecting with other entrepreneurs</p>
          <button
            onClick={() => setActiveTab('discover')}
            className="btn-primary"
          >
            Discover People
          </button>
        </div>
      ) : (
        connections.map((connection) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-hover flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <UserCircleIcon className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900">
                  {connection.sender_user_id === currentUser?.id 
                    ? `${connection.receiver_first_name} ${connection.receiver_last_name}`
                    : `${connection.sender_first_name} ${connection.sender_last_name}`}
                </h3>
                <p className="text-sm text-gray-600">
                  {connection.sender_user_id === currentUser?.id 
                    ? connection.receiver_bio 
                    : connection.sender_bio}
                </p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>Connected {new Date(connection.created_at).toLocaleDateString()}</span>
                  {((connection.sender_user_id === currentUser?.id 
                      ? connection.receiver_open_to_work 
                      : connection.sender_open_to_work)) && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Open to work
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleMessage(connection)}
                className="btn-outline flex items-center"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                Message
              </button>
              <button 
                onClick={() => handleViewProfile(
                  connection.sender_user_id === currentUser?.id 
                    ? connection.receiver_id 
                    : connection.sender_id
                )}
                className="btn-outline"
              >
                View Profile
              </button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )

  const renderRequests = () => (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <UserPlusIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
          <p className="text-gray-600">Connection requests will appear here</p>
        </div>
      ) : (
        requests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-l-4 border-l-blue-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <UserCircleIcon className="h-12 w-12 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {request.sender_name}
                  </h3>
                  <p className="text-sm text-gray-600">{request.sender_bio}</p>
                  
                  {request.message && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Sent {new Date(request.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRequestResponse(request.id, 'accepted')}
                  className="btn bg-green-600 text-white hover:bg-green-700 flex items-center"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Accept
                </button>
                <button
                  onClick={() => handleRequestResponse(request.id, 'rejected')}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Decline
                </button>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )

  const renderDiscover = () => (
    <div>
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Users grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-hover text-center"
            >
              <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              
              <h3 className="font-medium text-gray-900 mb-1">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">@{user.username}</p>
              
              {user.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{user.bio}</p>
              )}
              
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {user.open_to_work && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Open to work
                  </span>
                )}
                {user.open_to_co_founding && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Co-founding
                  </span>
                )}
                {user.is_recruiter && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    Recruiter
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleConnectionRequest(user.id, `Hi ${user.first_name}, I'd like to connect with you!`)}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <UserPlusIcon className="h-4 w-4 mr-1" />
                  Connect
                </button>
                <button 
                  onClick={() => handleViewProfile(user.id)}
                  className="w-full btn-outline"
                >
                  View Profile
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connections</h1>
        <p className="text-gray-600">Build your network and connect with fellow entrepreneurs</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
                {tab.id === 'requests' && requests.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {requests.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading..." />
      ) : (
        <div>
          {activeTab === 'connections' && renderConnections()}
          {activeTab === 'requests' && renderRequests()}
          {activeTab === 'discover' && renderDiscover()}
        </div>
      )}
    </div>
  )
}

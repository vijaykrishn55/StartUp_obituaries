import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { messagesAPI, connectionsAPI, authAPI } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import MessageChat from '../components/MessageChat'
import useSocket from '../hooks/useSocket'
import { cn, formatRelativeTime } from '../lib/utils'

export default function MessagesPage() {
  const [connections, setConnections] = useState([])
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { onMessageNotification } = useSocket()

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    // Set up message notification listener
    const unsubscribe = onMessageNotification((notification) => {
      // Update connection list to show new message indicator
      setConnections(prev => prev.map(conn => 
        conn.id === notification.connectionId 
          ? { ...conn, unread_count: (conn.unread_count || 0) + 1, last_message: notification.preview }
          : conn
      ));
    });

    return unsubscribe;
  }, [onMessageNotification]);

  const loadInitialData = async () => {
    try {
      // Load current user and connections
      const [userResponse, connectionsResponse] = await Promise.all([
        authAPI.getProfile(),
        connectionsAPI.getConnections()
      ]);

      setCurrentUser(userResponse.data);
      
      const acceptedConnections = (connectionsResponse.data.connections || connectionsResponse.data || []).filter(
        conn => conn.status === 'accepted'
      );
      setConnections(acceptedConnections);
      
      if (acceptedConnections.length > 0 && !selectedConnection) {
        setSelectedConnection(acceptedConnections[0]);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getConnectionDisplayName = (connection) => {
    if (!currentUser) return 'Unknown User';
    
    // Determine which user info to display based on current user
    if (connection.sender_user_id === currentUser.id) {
      return `${connection.receiver_first_name} ${connection.receiver_last_name}`;
    } else {
      return `${connection.sender_first_name} ${connection.sender_last_name}`;
    }
  }

  const filteredConnections = connections.filter(conn => {
    const displayName = getConnectionDisplayName(conn);
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  })

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading conversations..." />
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-200px)]">
      <div className="flex h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Connections Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Messages</h2>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 text-sm"
              />
            </div>
          </div>

          {/* Connections List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConnections.length === 0 ? (
              <div className="p-4 text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">No conversations</h3>
                <p className="text-xs text-gray-600">Connect with people to start messaging</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConnections.map((connection) => (
                  <button
                    key={connection.id}
                    onClick={() => setSelectedConnection(connection)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition-colors duration-200',
                      selectedConnection?.id === connection.id
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {getConnectionDisplayName(connection)}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {connection.last_message || 'No messages yet'}
                        </p>
                      </div>
                      {connection.unread_count > 0 && (
                        <div className="bg-primary-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {connection.unread_count}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConnection && currentUser ? (
            <MessageChat connection={selectedConnection} currentUser={currentUser} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a connection to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { conversationsAPI, connectionsAPI, authAPI } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import MessageChat from '../components/MessageChat'
import useSocket from '../hooks/useSocket'
import { cn, formatRelativeTime } from '../lib/utils'

export default function MessagesPage() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showConnectionsList, setShowConnectionsList] = useState(false)
  const [availableConnections, setAvailableConnections] = useState([])
  
  const { onMessageNotification } = useSocket()

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    // Set up message notification listener
    const unsubscribe = onMessageNotification((notification) => {
      console.log('Message notification received:', notification)
      // Update conversation list with new message preview
      setConversations(prev => prev.map(conv => 
        conv.id === notification.conversationId 
          ? { 
              ...conv, 
              last_message: notification.preview,
              unread_count: (conv.unread_count || 0) + 1,
              last_message_at: new Date().toISOString()
            }
          : conv
      ))
    })

    return unsubscribe
  }, [onMessageNotification])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      // Load current user and conversations
      const [userResponse, conversationsResponse] = await Promise.all([
        authAPI.getProfile(),
        conversationsAPI.getConversations()
      ])

      setCurrentUser(userResponse.data)
      setConversations(conversationsResponse.data.conversations || [])
      
      console.log('Loaded conversations:', conversationsResponse.data.conversations)
      console.log('Current user:', userResponse.data)
      
      // Select first conversation if available
      if (conversationsResponse.data.conversations?.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationsResponse.data.conversations[0])
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableConnections = async () => {
    try {
      const response = await connectionsAPI.getConnections()
      const acceptedConnections = (response.data.connections || response.data || [])
        .filter(conn => conn.status === 'accepted')
      
      // Filter out connections that already have conversations
      const conversationConnectionIds = conversations.map(conv => conv.connection_id)
      const availableConns = acceptedConnections.filter(
        conn => !conversationConnectionIds.includes(conn.id)
      )
      
      setAvailableConnections(availableConns)
    } catch (error) {
      console.error('Failed to load connections:', error)
    }
  }

  const handleStartNewConversation = async (connection) => {
    try {
      // Create conversation for this connection
      const response = await conversationsAPI.createConversation(connection.id)
      const newConversation = response.data.conversation
      
      // Add to conversations list
      setConversations(prev => [newConversation, ...prev])
      setSelectedConversation(newConversation)
      setShowConnectionsList(false)
      
      // Remove from available connections
      setAvailableConnections(prev => prev.filter(conn => conn.id !== connection.id))
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  const getConnectionDisplayName = (connection) => {
    if (!currentUser) return 'Unknown User'
    
    if (connection.sender_user_id === currentUser.id) {
      return `${connection.receiver_first_name || ''} ${connection.receiver_last_name || ''}`.trim() ||
             connection.receiver_username || 'Unknown User'
    } else {
      return `${connection.sender_first_name || ''} ${connection.sender_last_name || ''}`.trim() ||
             connection.sender_username || 'Unknown User'
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const title = conv.title || conv.other_user?.name || 'Unknown User'
    return title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading conversations..." />
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-200px)]">
      <div className="flex h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
              <button
                onClick={() => {
                  setShowConnectionsList(!showConnectionsList)
                  if (!showConnectionsList) {
                    loadAvailableConnections()
                  }
                }}
                className="btn-outline text-sm flex items-center"
                title="Start new conversation"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                New
              </button>
            </div>
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

          {/* Conversations List or New Conversation */}
          <div className="flex-1 overflow-y-auto">
            {showConnectionsList ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Start New Conversation</h3>
                  <button
                    onClick={() => setShowConnectionsList(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-2">
                  {availableConnections.length === 0 ? (
                    <div className="text-center py-8">
                      <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">No new connections available</p>
                      <p className="text-xs text-gray-500 mt-1">
                        All your connections already have conversations
                      </p>
                    </div>
                  ) : (
                    availableConnections.map((connection) => (
                      <button
                        key={connection.id}
                        onClick={() => handleStartNewConversation(connection)}
                        className="w-full p-3 rounded-lg text-left hover:bg-gray-50 border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {getConnectionDisplayName(connection).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {getConnectionDisplayName(connection)}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Connected {new Date(connection.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <>
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No conversations</h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Connect with people to start messaging
                    </p>
                    <button
                      onClick={() => {
                        setShowConnectionsList(true)
                        loadAvailableConnections()
                      }}
                      className="btn-primary text-xs"
                    >
                      Start Conversation
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={cn(
                          'w-full p-3 rounded-lg text-left transition-colors duration-200',
                          selectedConversation?.id === conversation.id
                            ? 'bg-primary-50 border border-primary-200'
                            : 'hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {(conversation.title || conversation.other_user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {conversation.title || conversation.other_user?.name || 'Unknown User'}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.last_message || 'No messages yet'}
                            </p>
                            {conversation.last_message_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatRelativeTime(conversation.last_message_at)}
                              </p>
                            )}
                          </div>
                          {conversation.unread_count > 0 && (
                            <div className="bg-primary-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unread_count}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation && currentUser ? (
            <MessageChat 
              conversation={selectedConversation} 
              currentUser={currentUser}
              onConversationUpdate={(updatedConversation) => {
                setConversations(prev => prev.map(conv => 
                  conv.id === updatedConversation.id ? updatedConversation : conv
                ))
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

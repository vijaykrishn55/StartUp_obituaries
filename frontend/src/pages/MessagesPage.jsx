import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { messagesAPI, connectionsAPI } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { clsx } from 'clsx'

export default function MessagesPage() {
  const [connections, setConnections] = useState([])
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConnections()
  }, [])

  useEffect(() => {
    if (selectedConnection) {
      loadMessages(selectedConnection.id)
    }
  }, [selectedConnection])

  const loadConnections = async () => {
    try {
      const response = await connectionsAPI.getConnections()
      const acceptedConnections = (response.data.connections || []).filter(
        conn => conn.status === 'accepted'
      )
      setConnections(acceptedConnections)
      
      if (acceptedConnections.length > 0 && !selectedConnection) {
        setSelectedConnection(acceptedConnections[0])
      }
    } catch (error) {
      console.error('Failed to load connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (connectionId) => {
    setMessagesLoading(true)
    try {
      const response = await messagesAPI.getMessages(connectionId)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConnection) return

    try {
      const response = await messagesAPI.sendMessage(selectedConnection.id, newMessage)
      setMessages(prev => [...prev, response.data.message])
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const filteredConnections = connections.filter(conn =>
    conn.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                    className={clsx(
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
                          {connection.user_name}
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
          {selectedConnection ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedConnection.user_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Connected {new Date(selectedConnection.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="flex justify-center">
                    <LoadingSpinner size="sm" text="Loading messages..." />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No messages yet</h3>
                    <p className="text-gray-600">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwnMessage = message.is_own_message
                    const showAvatar = index === 0 || messages[index - 1].is_own_message !== isOwnMessage
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx(
                          'flex',
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div className={clsx(
                          'flex max-w-xs lg:max-w-md',
                          isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                        )}>
                          {showAvatar && (
                            <UserCircleIcon className={clsx(
                              'h-8 w-8 text-gray-400',
                              isOwnMessage ? 'ml-2' : 'mr-2'
                            )} />
                          )}
                          
                          <div className={clsx(
                            'px-4 py-2 rounded-lg',
                            isOwnMessage 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-100 text-gray-900',
                            !showAvatar && (isOwnMessage ? 'mr-10' : 'ml-10')
                          )}>
                            <p className="text-sm">{message.content}</p>
                            <p className={clsx(
                              'text-xs mt-1',
                              isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                            )}>
                              {formatMessageTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 input"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="btn-primary flex items-center disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
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

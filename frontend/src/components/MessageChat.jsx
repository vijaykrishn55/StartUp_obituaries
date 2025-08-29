import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, UserIcon } from '@heroicons/react/24/outline';
import useSocket from '../hooks/useSocket';
import { messagesAPI } from '../lib/api';

const MessageChat = ({ connection, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    isConnected,
    joinConnection,
    sendMessage,
    markMessagesRead,
    startTyping,
    stopTyping,
    onNewMessage,
    onUserTyping,
    onUserStoppedTyping,
    onMessagesRead
  } = useSocket();

  // Get other user info
  const otherUser = connection.sender_user_id === currentUser.id 
    ? { id: connection.receiver_user_id, username: connection.receiver_username, first_name: connection.receiver_first_name, last_name: connection.receiver_last_name }
    : { id: connection.sender_user_id, username: connection.sender_username, first_name: connection.sender_first_name, last_name: connection.sender_last_name };

  // Load messages on component mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await messagesAPI.getMessages(connection.id);
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [connection.id]);

  // Join connection room and set up socket listeners
  useEffect(() => {
    if (isConnected) {
      joinConnection(connection.id);
    }

    // Set up socket event listeners
    const unsubscribeNewMessage = onNewMessage((message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    const unsubscribeUserTyping = onUserTyping(({ userId, username }) => {
      if (userId !== currentUser.id) {
        setTypingUsers(prev => new Set(prev).add(username));
      }
    });

    const unsubscribeUserStoppedTyping = onUserStoppedTyping(({ userId }) => {
      if (userId !== currentUser.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          // Remove by userId (we need to map back to username)
          newSet.delete(otherUser.username);
          return newSet;
        });
      }
    });

    const unsubscribeMessagesRead = onMessagesRead(({ connectionId, readBy }) => {
      if (connectionId === connection.id && readBy !== currentUser.id) {
        setMessages(prev => prev.map(msg => 
          msg.sender_user_id === currentUser.id ? { ...msg, is_read: true } : msg
        ));
      }
    });

    return () => {
      unsubscribeNewMessage?.();
      unsubscribeUserTyping?.();
      unsubscribeUserStoppedTyping?.();
      unsubscribeMessagesRead?.();
    };
  }, [isConnected, connection.id, currentUser.id, otherUser.username]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when component is visible
  useEffect(() => {
    if (messages.length > 0 && isConnected) {
      const unreadMessages = messages.filter(msg => 
        msg.sender_user_id !== currentUser.id && !msg.is_read
      );
      if (unreadMessages.length > 0) {
        markMessagesRead(connection.id);
      }
    }
  }, [messages, isConnected, connection.id, currentUser.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    sendMessage(connection.id, newMessage.trim());
    setNewMessage('');
    stopTyping(connection.id);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicators
    if (e.target.value.trim() && isConnected) {
      startTyping(connection.id);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(connection.id);
      }, 2000);
    } else {
      stopTyping(connection.id);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherUser.first_name} {otherUser.last_name}
            </h3>
            <p className="text-sm text-gray-500">@{otherUser.username}</p>
          </div>
        </div>
        <div className="ml-auto">
          {isConnected ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Disconnected
            </span>
          )}
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_user_id === currentUser.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center justify-between mt-1 text-xs ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span>{formatMessageTime(message.created_at)}</span>
                    {isOwnMessage && (
                      <span className="ml-2">
                        {message.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg max-w-xs">
              <p className="text-sm italic">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageChat;

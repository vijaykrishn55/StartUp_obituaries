import React, { useState, useEffect, useRef } from 'react';
import { 
  PaperAirplaneIcon, 
  UserIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon, 
  HandThumbUpIcon,
  FaceSmileIcon
} from '@heroicons/react/24/solid';
import useSocket from '../hooks/useSocket';
import { messagesAPI } from '../lib/api';
import { formatRelativeTime } from '../lib/utils';
import './MessageChat.css';

const MessageChat = ({ conversation, currentUser, onConversationUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    isConnected,
    joinConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    markMessagesRead,
    startTyping,
    stopTyping,
    onNewMessage,
    onMessageEdited,
    onMessageDeleted,
    onMessageReactionUpdated,
    onUserTyping,
    onMessagesRead
  } = useSocket();

  // Load messages when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversation?.id) return;
      try {
        setLoading(true);
        console.log('Loading messages for conversation:', conversation.id);
        console.log('Current user for message loading:', currentUser);
        const response = await messagesAPI.getMessages(conversation.id);
        console.log('Loaded messages response:', response.data);
        const loadedMessages = response.data.messages || [];
        console.log('Setting messages:', loadedMessages);
        setMessages(loadedMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [conversation?.id, currentUser?.id]);

  // Join conversation and set up socket listeners
  useEffect(() => {
    if (isConnected && conversation?.id) {
      joinConversation(conversation.id);
    }

    // Set up socket event listeners
    const unsubscribeNewMessage = onNewMessage((data) => {
      if (data.conversationId === conversation?.id) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
        if (onConversationUpdate) {
          onConversationUpdate({
            ...conversation,
            last_message: data.message.content,
            last_message_at: data.message.created_at
          });
        }
      }
    });

    const unsubscribeUserTyping = onUserTyping((data) => {
      if (data.conversationId === conversation?.id && data.userId !== currentUser?.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.username);
          } else {
            newSet.delete(data.username);
          }
          return newSet;
        });
      }
    });

    const unsubscribeMessageEdited = onMessageEdited((data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, content: data.content, edited_at: data.editedAt }
          : msg
      ));
    });

    const unsubscribeMessageDeleted = onMessageDeleted((data) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    });

    const unsubscribeReactionUpdated = onMessageReactionUpdated((data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, reactions: data.reactions }
          : msg
      ));
    });

    const unsubscribeMessagesRead = onMessagesRead((data) => {
      if (data.conversationId === conversation?.id && data.readBy !== currentUser?.id) {
        setMessages(prev => prev.map(msg => 
          data.messageIds?.includes(msg.id) ? { ...msg, is_read_by_user: true } : msg
        ));
      }
    });

    return () => {
      unsubscribeNewMessage?.();
      unsubscribeUserTyping?.();
      unsubscribeMessageEdited?.();
      unsubscribeMessageDeleted?.();
      unsubscribeReactionUpdated?.();
      unsubscribeMessagesRead?.();
    };
  }, [isConnected, conversation?.id, currentUser?.id]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when component is visible
  useEffect(() => {
    if (messages.length > 0 && isConnected && conversation?.id) {
      const unreadMessages = messages.filter(msg => 
        msg.sender_id !== currentUser?.id && !msg.is_read_by_user
      );
      if (unreadMessages.length > 0) {
        markMessagesRead(conversation.id);
      }
    }
  }, [messages, isConnected, conversation?.id, currentUser?.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected || !conversation?.id) return;

    sendMessage(conversation.id, newMessage.trim());
    setNewMessage('');
    stopTyping(conversation.id);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicators
    if (e.target.value.trim() && isConnected && conversation?.id) {
      startTyping(conversation.id);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(conversation.id);
      }, 2000);
    } else if (conversation?.id) {
      stopTyping(conversation.id);
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

  const handleEditMessage = async (messageId, content) => {
    if (!content.trim()) return;
    
    try {
      await messagesAPI.editMessage(messageId, content.trim());
      editMessage(messageId, content.trim());
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await messagesAPI.deleteMessage(messageId);
      deleteMessage(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleAddReaction = async (messageId, reaction) => {
    try {
      // Check if this is user's own message
      const message = messages.find(msg => msg.id === messageId);
      const isOwnMessage = message?.sender_id === currentUser?.id || message?.sender_user_id === currentUser?.id;
      
      if (isOwnMessage) {
        console.log('Cannot react to your own message');
        return;
      }
      
      // Check if user already reacted with this emoji
      const userAlreadyReacted = message?.reactions?.some(
        r => r.reaction === reaction && r.users?.includes(currentUser?.first_name + ' ' + currentUser?.last_name)
      );
      
      if (userAlreadyReacted) {
        console.log('User already reacted with this emoji');
        setShowReactionPicker(null);
        return;
      }
      
      await messagesAPI.addReaction(messageId, reaction);
      addReaction(messageId, reaction);
      setShowReactionPicker(null);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      if (error.response?.status === 403) {
        console.log('Cannot react to your own messages');
      }
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;
    
    messages.forEach(message => {
      const messageDate = new Date(message.created_at).toDateString();
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = {
          date: messageDate,
          messages: []
        };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push(message);
    });
    
    return groups;
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
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
              {conversation.title || conversation.other_user?.name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500">
              {conversation.other_user?.status === 'online' ? 'Online' : 
               conversation.other_user?.last_seen ? `Last seen recently` : 'Offline'}
            </p>
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
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          groupMessagesByDate(messages).map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {/* Date Header */}
              <div className="flex justify-center mb-4 message-date-header">
                <span className="bg-white bg-opacity-90 text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm border">
                  {formatDateHeader(group.date)}
                </span>
              </div>
              
              {/* Messages */}
              <div className="space-y-3">
                {group.messages.map((message, messageIndex) => {
                  const isOwnMessage = message.sender_id === currentUser?.id || message.sender_user_id === currentUser?.id;
                  console.log('Message:', message.id, 'sender_id:', message.sender_id, 'sender_user_id:', message.sender_user_id, 'currentUser.id:', currentUser?.id, 'isOwnMessage:', isOwnMessage);
                  console.log('Full message object:', message);
                  console.log('Full currentUser object:', currentUser);
                  const isEditing = editingMessage === message.id;
                  const showActions = hoveredMessage === message.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} message-container`}
                      onMouseEnter={() => setHoveredMessage(message.id)}
                      onMouseLeave={() => setHoveredMessage(null)}
                    >
                      <div className={`max-w-xs lg:max-w-md group relative`}>
                        {isEditing ? (
                          <div className="bg-gray-100 rounded-lg p-3">
                            <input
                              type="text"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditMessage(message.id, editContent);
                                }
                                if (e.key === 'Escape') {
                                  setEditingMessage(null);
                                  setEditContent('');
                                }
                              }}
                              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              autoFocus
                            />
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => handleEditMessage(message.id, editContent)}
                                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMessage(null);
                                  setEditContent('');
                                }}
                                className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`px-4 py-2 rounded-lg relative message-bubble ${
                              isOwnMessage
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            
                            {/* Message reactions */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {message.reactions.map((reaction, idx) => (
                                  <span 
                                    key={idx} 
                                    className={`text-xs rounded-full px-2 py-1 cursor-pointer ${
                                      isOwnMessage 
                                        ? 'bg-white bg-opacity-20 text-white' 
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                    title={reaction.users}
                                  >
                                    {reaction.reaction} {reaction.count}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className={`flex items-center justify-between mt-1 text-xs ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <span>
                                {formatMessageTime(message.created_at)}
                                {message.edited_at && ' (edited)'}
                              </span>
                              {isOwnMessage && (
                                <span className="ml-2 flex items-center">
                                  {message.is_read_by_user ? (
                                    <div className="flex">
                                      <CheckIcon className="w-3 h-3" />
                                      <CheckIcon className="w-3 h-3 -ml-1" />
                                    </div>
                                  ) : (
                                    <CheckIcon className="w-3 h-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Message actions (show on hover) */}
                        {!isEditing && showActions && (
                          <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-100 transition-opacity z-10`}>
                            <div className="flex items-center bg-white border rounded-lg shadow-lg p-1 ml-2">
                              {/* Reaction buttons - only show for messages from others */}
                              {!isOwnMessage && (
                                <>
                                  <button
                                    onClick={() => handleAddReaction(message.id, '👍')}
                                    className="p-1 hover:bg-gray-100 rounded text-lg reaction-button"
                                    title="Like"
                                  >
                                    👍
                                  </button>
                                  <button
                                    onClick={() => handleAddReaction(message.id, '❤️')}
                                    className="p-1 hover:bg-gray-100 rounded text-lg reaction-button"
                                    title="Love"
                                  >
                                    ❤️
                                  </button>
                                  <button
                                    onClick={() => handleAddReaction(message.id, '😂')}
                                    className="p-1 hover:bg-gray-100 rounded text-lg reaction-button"
                                    title="Laugh"
                                  >
                                    😂
                                  </button>
                                </>
                              )}
                              
                              {/* Edit and delete for own messages */}
                              {isOwnMessage && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingMessage(message.id);
                                      setEditContent(message.content);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    title="Edit"
                                  >
                                    <PencilIcon className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    title="Delete"
                                  >
                                    <TrashIcon className="w-4 h-4 text-red-600" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        
        {/* Enhanced Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg max-w-xs flex items-center space-x-3">
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
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

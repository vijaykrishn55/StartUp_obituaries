import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './Auth/LoginForm';
import ConversationList from './Chat/ConversationList';
import ChatWindow from './Chat/ChatWindow';
import UserProfile from './Auth/UserProfile';
import apiClient from '../services/api';
import websocketService from '../services/websocket';
import './MessagingApp.css';

const MessagingApp = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Define callback functions first to avoid hoisting issues
  const handleNewMessage = useCallback((data) => {
    console.log('📨 New message received:', data);
    const { message, conversationId } = data;
    console.log('📝 Message content:', message.content);
    console.log('📝 Message object:', message);
    
    // Update messages - ensure we don't add duplicates
    setMessages(prev => {
      const existingMessages = prev[conversationId] || [];
      const messageExists = existingMessages.some(msg => msg.id === message.id);
      
      if (messageExists) {
        console.log('🔄 Message already exists, skipping duplicate');
        return prev;
      }
      
      const updatedMessages = [...existingMessages, message];
      console.log('📦 Updated messages for conversation', conversationId, ':', updatedMessages);
      
      return {
        ...prev,
        [conversationId]: updatedMessages
      };
    });

    // Update conversation's last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              last_message: message.content,
              last_message_at: message.created_at,
              unread_count: message.sender_id === user?.id ? conv.unread_count : (conv.unread_count || 0) + 1
            }
          : conv
      ).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
    );
  }, [user?.id]);

  const handleUserStatusChange = useCallback((data) => {
    const { userId, status } = data;
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (status === 'online') {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  const handleMessageEdited = useCallback((data) => {
    const { message } = data;
    setMessages(prev => ({
      ...prev,
      [message.conversation_id]: prev[message.conversation_id]?.map(msg =>
        msg.id === message.id ? message : msg
      ) || []
    }));
  }, []);

  const handleMessageDeleted = useCallback((data) => {
    const { messageId } = data;
    setMessages(prev => {
      const newMessages = { ...prev };
      Object.keys(newMessages).forEach(conversationId => {
        newMessages[conversationId] = newMessages[conversationId].filter(
          msg => msg.id !== messageId
        );
      });
      return newMessages;
    });
  }, []);

  const setupWebSocketListeners = useCallback(() => {
    websocketService.on('new_message', handleNewMessage);
    websocketService.on('user_status_changed', handleUserStatusChange);
    websocketService.on('message_edited', handleMessageEdited);
    websocketService.on('message_deleted', handleMessageDeleted);
  }, [handleNewMessage, handleUserStatusChange, handleMessageEdited, handleMessageDeleted]);

  const loadConversations = async () => {
    try {
      const response = await apiClient.getConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Load conversations when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
      setupWebSocketListeners();
    }
    
    return () => {
      if (websocketService) {
        websocketService.off('new_message', handleNewMessage);
        websocketService.off('user_status_changed', handleUserStatusChange);
        websocketService.off('message_edited', handleMessageEdited);
        websocketService.off('message_deleted', handleMessageDeleted);
      }
    };
  }, [isAuthenticated, setupWebSocketListeners, handleNewMessage, handleUserStatusChange, handleMessageEdited, handleMessageDeleted]);

  const handleConversationSelect = async (conversation) => {
    console.log('💼 Selecting conversation:', conversation);
    setSelectedConversation(conversation);
    
    // Always reload messages to ensure synchronization
    console.log('📎 Loading messages for conversation:', conversation.id);
    try {
      const response = await apiClient.getMessages(conversation.id);
      console.log('📎 Loaded messages:', response.messages);
      setMessages(prev => ({
        ...prev,
        [conversation.id]: response.messages || []
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      // Set empty array if loading fails
      setMessages(prev => ({
        ...prev,
        [conversation.id]: []
      }));
    }

    // Join conversation room via WebSocket - this is critical for real-time messaging
    if (websocketService.isSocketConnected()) {
      console.log('🔌 Joining WebSocket room for conversation:', conversation.id);
      websocketService.joinConversation(conversation.id);
    } else {
      console.error('❌ WebSocket not connected!');
    }

    // Mark messages as read
    const conversationMessages = messages[conversation.id] || [];
    const unreadMessages = conversationMessages
      .filter(msg => msg.sender_id !== user?.id)
      .map(msg => msg.id);
    
    if (unreadMessages.length > 0) {
      try {
        await apiClient.markMessagesAsRead(unreadMessages);
        // Update conversation unread count
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
          )
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  const handleSendMessage = async (content, replyToId = null) => {
    if (!selectedConversation) return;

    console.log('🚀 Sending message:', {
      conversationId: selectedConversation.id,
      content,
      replyToId,
      isWebSocketConnected: websocketService.isSocketConnected()
    });

    try {
      // Send via WebSocket for real-time delivery
      websocketService.sendMessage(
        selectedConversation.id, 
        content, 
        'text', 
        replyToId
      );
      console.log('✅ Message sent via WebSocket');
    } catch (error) {
      console.error('Error sending message via WebSocket:', error);
      // Fallback to API
      try {
        const response = await apiClient.sendMessage({
          conversationId: selectedConversation.id,
          content,
          replyToId
        });
        console.log('✅ Message sent via API fallback:', response);
      } catch (apiError) {
        console.error('API fallback failed:', apiError);
      }
    }
  };

  const handleCreateConversation = async (participantIds, title = null, type = 'direct') => {
    try {
      const response = await apiClient.createConversation({
        type,
        title,
        participantIds
      });
      
      setConversations(prev => [response.conversation, ...prev]);
      setSelectedConversation(response.conversation);
      return response.conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="messaging-app loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="messaging-app">
      <div className="app-header">
        <h1>Messaging App</h1>
        <div className="header-actions">
          <button 
            className="profile-btn"
            onClick={() => setShowProfile(true)}
          >
            <span className="user-avatar">
              {user?.display_name?.charAt(0).toUpperCase() || 'U'}
            </span>
            <span className="user-name">{user?.display_name || user?.username}</span>
          </button>
        </div>
      </div>

      <div className="app-content">
        <div className="sidebar">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onConversationSelect={handleConversationSelect}
            onCreateConversation={handleCreateConversation}
            onlineUsers={onlineUsers}
            currentUser={user}
          />
        </div>

        <div className="main-content">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              messages={messages[selectedConversation.id] || []}
              onSendMessage={handleSendMessage}
              currentUser={user}
              onlineUsers={onlineUsers}
            />
          ) : (
            <div className="no-conversation-selected">
              <h2>Welcome to Messaging App</h2>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {showProfile && (
        <UserProfile
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};

export default MessagingApp;
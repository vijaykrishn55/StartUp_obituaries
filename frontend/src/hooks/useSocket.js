import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io('http://localhost:3000', {
      auth: {
        token
      },
      autoConnect: true
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const joinConversation = (conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', conversationId);
    }
  };

  const sendMessage = (conversationId, content, messageType = 'text', replyToId = null) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', { 
        conversationId, 
        content, 
        messageType, 
        replyToId 
      });
    }
  };

  const editMessage = (messageId, content) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('edit_message', { messageId, content });
    }
  };

  const deleteMessage = (messageId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('delete_message', { messageId });
    }
  };

  const addReaction = (messageId, reaction) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('add_reaction', { messageId, reaction });
    }
  };

  const markMessagesRead = (conversationId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark_messages_read', { conversationId });
    }
  };

  const startTyping = (conversationId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_start', { conversationId });
    }
  };

  const stopTyping = (conversationId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_stop', { conversationId });
    }
  };

  const onNewMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('new_message', callback);
      return () => socketRef.current.off('new_message', callback);
    }
  };

  const onMessageNotification = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('message_notification', callback);
      return () => socketRef.current.off('message_notification', callback);
    }
  };

  const onMessageEdited = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('message_edited', callback);
      return () => socketRef.current.off('message_edited', callback);
    }
  };

  const onMessageDeleted = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('message_deleted', callback);
      return () => socketRef.current.off('message_deleted', callback);
    }
  };

  const onMessageReactionUpdated = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('message_reaction_updated', callback);
      return () => socketRef.current.off('message_reaction_updated', callback);
    }
  };

  const onUserTyping = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('user_typing', callback);
      return () => socketRef.current.off('user_typing', callback);
    }
  };

  const onMessagesRead = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('messages_read', callback);
      return () => socketRef.current.off('messages_read', callback);
    }
  };

  const onUserJoinedConversation = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('user_joined_conversation', callback);
      return () => socketRef.current.off('user_joined_conversation', callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    joinConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    markMessagesRead,
    startTyping,
    stopTyping,
    onNewMessage,
    onMessageNotification,
    onMessageEdited,
    onMessageDeleted,
    onMessageReactionUpdated,
    onUserTyping,
    onMessagesRead,
    onUserJoinedConversation
  };
};

export default useSocket;

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

  const joinConnection = (connectionId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_connection', connectionId);
    }
  };

  const sendMessage = (connectionId, content) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', { connectionId, content });
    }
  };

  const markMessagesRead = (connectionId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark_messages_read', connectionId);
    }
  };

  const startTyping = (connectionId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_start', connectionId);
    }
  };

  const stopTyping = (connectionId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_stop', connectionId);
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

  const onUserTyping = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('user_typing', callback);
      return () => socketRef.current.off('user_typing', callback);
    }
  };

  const onUserStoppedTyping = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('user_stopped_typing', callback);
      return () => socketRef.current.off('user_stopped_typing', callback);
    }
  };

  const onMessagesRead = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('messages_read', callback);
      return () => socketRef.current.off('messages_read', callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    joinConnection,
    sendMessage,
    markMessagesRead,
    startTyping,
    stopTyping,
    onNewMessage,
    onMessageNotification,
    onUserTyping,
    onUserStoppedTyping,
    onMessagesRead
  };
};

export default useSocket;

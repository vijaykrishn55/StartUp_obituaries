import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.isConnected = true;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
        this.isConnected = false;
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Set up event listeners
      this.setupEventListeners();
    });
  }

  setupEventListeners() {
    // Message events
    this.socket.on('new_message', (data) => {
      this.emit('new_message', data);
    });

    this.socket.on('message_edited', (data) => {
      this.emit('message_edited', data);
    });

    this.socket.on('message_deleted', (data) => {
      this.emit('message_deleted', data);
    });

    this.socket.on('message_reaction_updated', (data) => {
      this.emit('message_reaction_updated', data);
    });

    // Typing events
    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    // User status events
    this.socket.on('user_status_changed', (data) => {
      this.emit('user_status_changed', data);
    });

    // Conversation events
    this.socket.on('user_joined_conversation', (data) => {
      this.emit('user_joined_conversation', data);
    });

    this.socket.on('user_left_conversation', (data) => {
      this.emit('user_left_conversation', data);
    });

    this.socket.on('joined_conversation', (data) => {
      this.emit('joined_conversation', data);
    });
  }

  disconnect() {
    if (this.socket) {
      // Remove all custom event listeners
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }

  // Message actions
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  sendMessage(conversationId, content, messageType = 'text', replyToId = null) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        conversationId,
        content,
        messageType,
        replyToId
      });
    }
  }

  editMessage(messageId, content) {
    if (this.socket && this.isConnected) {
      this.socket.emit('edit_message', { messageId, content });
    }
  }

  deleteMessage(messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('delete_message', { messageId });
    }
  }

  addReaction(messageId, reaction) {
    if (this.socket && this.isConnected) {
      this.socket.emit('add_reaction', { messageId, reaction });
    }
  }

  // Typing indicators
  startTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  stopTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  // Connection status
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

export default new WebSocketService();
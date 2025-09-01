import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import websocketService from '../../services/websocket';
import { formatDistanceToNow } from 'date-fns';
import './ChatWindow.css';

const ChatWindow = ({ 
  conversation, 
  messages, 
  onSendMessage, 
  currentUser, 
  onlineUsers 
}) => {
  const [typingUsers, setTypingUsers] = useState(new Map());
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up typing listeners
  useEffect(() => {
    const handleUserTyping = (data) => {
      if (data.conversationId === conversation.id && data.userId !== currentUser?.id) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (data.isTyping) {
            newMap.set(data.userId, {
              username: data.username,
              timestamp: Date.now()
            });
          } else {
            newMap.delete(data.userId);
          }
          return newMap;
        });

        // Clear typing indicator after 3 seconds of inactivity
        if (data.isTyping) {
          const timeoutId = setTimeout(() => {
            setTypingUsers(prev => {
              const newMap = new Map(prev);
              const userTyping = newMap.get(data.userId);
              if (userTyping && Date.now() - userTyping.timestamp > 2500) {
                newMap.delete(data.userId);
                return newMap;
              }
              return prev;
            });
          }, 3000);
          
          // Store timeout ID for cleanup
          return () => clearTimeout(timeoutId);
        }
      }
    };

    websocketService.on('user_typing', handleUserTyping);

    return () => {
      websocketService.off('user_typing', handleUserTyping);
    };
  }, [conversation.id, currentUser?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content, replyToId = null) => {
    onSendMessage(content, replyToId);
  };

  const handleTyping = (isTyping) => {
    if (isTyping) {
      websocketService.startTyping(conversation.id);
    } else {
      websocketService.stopTyping(conversation.id);
    }
  };

  const getConversationTitle = () => {
    if (conversation.type === 'group') {
      return conversation.title;
    }
    
    const otherParticipant = conversation.participants?.find(p => p.id !== currentUser?.id);
    return otherParticipant?.display_name || 'Unknown User';
  };

  const getConversationStatus = () => {
    if (conversation.type === 'group') {
      const onlineCount = conversation.participants?.filter(p => 
        p.id !== currentUser?.id && onlineUsers.has(p.id)
      ).length || 0;
      const totalOthers = (conversation.participants?.length || 1) - 1;
      return `${onlineCount} of ${totalOthers} online`;
    }
    
    const otherParticipant = conversation.participants?.find(p => p.id !== currentUser?.id);
    if (!otherParticipant) return 'Unknown';
    
    return onlineUsers.has(otherParticipant.id) ? 'Online' : 
           `Last seen ${formatDistanceToNow(new Date(otherParticipant.last_seen || Date.now()), { addSuffix: true })}`;
  };

  // Group messages by date
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
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const messageGroups = groupMessagesByDate(messages || []);
  const typingUsersList = Array.from(typingUsers.values());

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="conversation-info">
          <h2 className="conversation-title">{getConversationTitle()}</h2>
          <p className="conversation-status">{getConversationStatus()}</p>
        </div>
        
        <div className="chat-actions">
          {conversation.participants && conversation.participants.length > 2 && (
            <button className="participants-btn" title="View participants">
              👥 {conversation.participants.length}
            </button>
          )}
          <button className="menu-btn" title="More options">⋮</button>
        </div>
      </div>

      <div className="messages-container" ref={messagesContainerRef}>
        {messageGroups.length === 0 ? (
          <div className="no-messages">
            <h3>Start the conversation!</h3>
            <p>Send a message to begin chatting</p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="message-group">
              <div className="date-header">
                <span>{formatDateHeader(group.date)}</span>
              </div>
              
              {group.messages.map((message, index) => {
                const prevMessage = index > 0 ? group.messages[index - 1] : null;
                const nextMessage = index < group.messages.length - 1 ? group.messages[index + 1] : null;
                
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    currentUser={currentUser}
                    isConsecutive={prevMessage?.sender_id === message.sender_id}
                    isLastInGroup={!nextMessage || nextMessage.sender_id !== message.sender_id}
                  />
                );
              })}
            </div>
          ))
        )}

        {/* Typing indicators */}
        {typingUsersList.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-bubble">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div className="typing-text">
              {typingUsersList.length === 1 
                ? `${typingUsersList[0].username} is typing...`
                : `${typingUsersList.length} people are typing...`
              }
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        placeholder={`Message ${getConversationTitle()}`}
      />
    </div>
  );
};

export default ChatWindow;
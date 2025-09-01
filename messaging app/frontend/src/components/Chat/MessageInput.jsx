import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MessageInput = ({ 
  onSendMessage, 
  onTyping, 
  placeholder = "Type a message...",
  replyTo = null,
  onCancelReply = null 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  useEffect(() => {
    // Focus on input when component mounts
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (trimmedMessage) {
      onSendMessage(trimmedMessage, replyTo?.id || null);
      setMessage('');
      
      // Clear typing indicator
      if (isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emoji) => {
    console.log('😂 Emoji clicked:', emoji);
    setMessage(prev => {
      const newMessage = prev + emoji;
      console.log('😂 Message after emoji:', newMessage);
      return newMessage;
    });
    textareaRef.current?.focus();
  };

  const commonEmojis = ['😊', '😂', '😍', '👍', '❤️', '😢', '😮', '😡'];

  return (
    <div className="message-input-container">
      {replyTo && (
        <div className="reply-preview">
          <div className="reply-content">
            <span className="reply-icon">↩️</span>
            <div className="reply-info">
              <span className="reply-sender">{replyTo.sender_name}</span>
              <span className="reply-text">{replyTo.content}</span>
            </div>
          </div>
          {onCancelReply && (
            <button 
              className="cancel-reply-btn"
              onClick={onCancelReply}
              title="Cancel reply"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <form className="message-input-form" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <button 
            type="button" 
            className="emoji-btn"
            title="Add emoji"
          >
            😊
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="message-textarea"
            rows={1}
            maxLength={2000}
          />

          <button 
            type="button" 
            className="attachment-btn"
            title="Attach file"
          >
            📎
          </button>
        </div>

        <button 
          type="submit" 
          className={`send-btn ${message.trim() ? 'active' : ''}`}
          disabled={!message.trim()}
          title="Send message"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path 
              fill="currentColor" 
              d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
            />
          </svg>
        </button>
      </form>

      {/* Quick emoji picker */}
      <div className="quick-emojis">
        {commonEmojis.map((emoji, index) => (
          <button
            key={index}
            className="quick-emoji-btn"
            onClick={() => handleEmojiClick(emoji)}
            title={`Add ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="input-info">
        <span className="char-count">
          {message.length}/2000
        </span>
        <span className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </span>
      </div>
    </div>
  );
};

export default MessageInput;
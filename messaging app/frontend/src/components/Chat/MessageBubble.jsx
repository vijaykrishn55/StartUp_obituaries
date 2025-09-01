import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import './MessageBubble.css';

const MessageBubble = ({ 
  message, 
  currentUser, 
  isConsecutive = false,
  isLastInGroup = true 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(false);

  // Debug logging
  console.log('💬 MessageBubble rendering:', {
    messageId: message.id,
    content: message.content,
    messageType: message.message_type,
    senderName: message.display_name || message.username
  });

  const isOwnMessage = message.sender_id === currentUser?.id;
  const messageTime = new Date(message.created_at);
  const isEdited = message.edited_at !== null && message.edited_at !== undefined;
  const senderName = message.display_name || message.username || 'Unknown User';

  const formatTime = (date) => {
    return format(date, 'HH:mm');
  };

  const formatFullTimestamp = (date) => {
    return format(date, 'MMM d, yyyy HH:mm');
  };

  const handleMessageClick = () => {
    setShowTimestamp(!showTimestamp);
  };

  const handleReaction = (reaction) => {
    // TODO: Implement reaction functionality
    console.log(`Adding reaction ${reaction} to message ${message.id}`);
  };

  const handleReply = () => {
    // TODO: Implement reply functionality
    console.log(`Replying to message ${message.id}`);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log(`Editing message ${message.id}`);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log(`Deleting message ${message.id}`);
  };

  return (
    <div 
      className={`message-bubble ${isOwnMessage ? 'own-message' : 'other-message'} ${isConsecutive ? 'consecutive' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isConsecutive && !isOwnMessage && (
        <div className="message-sender">
          <span className="sender-name">{senderName}</span>
        </div>
      )}

      <div className="message-content-wrapper">
        {!isConsecutive && !isOwnMessage && (
          <div className="message-avatar">
            <span>{senderName.charAt(0).toUpperCase()}</span>
          </div>
        )}

        <div className="message-content">
          {message.reply_to && (
            <div className="reply-reference">
              <div className="reply-line"></div>
              <div className="reply-content">
                <span className="reply-sender">{message.reply_to.sender_name}</span>
                <span className="reply-text">{message.reply_to.content}</span>
              </div>
            </div>
          )}

          <div 
            className="message-text"
            onClick={handleMessageClick}
          >
            {message.content || ''}
            {isEdited && <span className="edited-indicator">(edited)</span>}
          </div>

          {showTimestamp && (
            <div className="message-timestamp-full">
              {formatFullTimestamp(messageTime)}
              {isEdited && (
                <span className="edited-time">
                  {' • edited ' + formatDistanceToNow(new Date(message.edited_at), { addSuffix: true })}
                </span>
              )}
            </div>
          )}

          {isLastInGroup && (
            <div className="message-time">
              {formatTime(messageTime)}
              {isOwnMessage && (
                <span className="message-status">
                  ✓✓ {/* TODO: Implement read status */}
                </span>
              )}
            </div>
          )}
        </div>

        {showActions && (
          <div className={`message-actions ${isOwnMessage ? 'own-actions' : 'other-actions'}`}>
            <button 
              className="action-btn reaction-btn"
              onClick={() => handleReaction('👍')}
              title="Add reaction"
            >
              😊
            </button>
            <button 
              className="action-btn reply-btn"
              onClick={handleReply}
              title="Reply"
            >
              ↩️
            </button>
            {isOwnMessage && (
              <>
                <button 
                  className="action-btn edit-btn"
                  onClick={handleEdit}
                  title="Edit"
                >
                  ✏️
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={handleDelete}
                  title="Delete"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Reactions display */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="message-reactions">
          {message.reactions.map((reaction, index) => (
            <button 
              key={index}
              className="reaction-item"
              onClick={() => handleReaction(reaction.reaction)}
              title={`${reaction.users} reacted with ${reaction.reaction}`}
            >
              {reaction.reaction} {reaction.count > 1 && reaction.count}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
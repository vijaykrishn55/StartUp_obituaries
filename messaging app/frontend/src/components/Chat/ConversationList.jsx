import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import apiClient from '../../services/api';
import './ConversationList.css';

const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onConversationSelect, 
  onCreateConversation,
  onlineUsers,
  currentUser 
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newConversationData, setNewConversationData] = useState({
    type: 'direct',
    title: '',
    participantUsername: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserSearch = async (username) => {
    console.log('handleUserSearch called with:', username);
    
    if (!username.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Making API call to search users...');
      const response = await apiClient.searchUsers(username);
      console.log('Search API response:', response);
      setSearchResults(response.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      console.error('Error details:', error.response?.data);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    
    try {
      if (newConversationData.type === 'direct') {
        let participantId = null;
        
        if (selectedUser) {
          participantId = selectedUser.id;
        } else {
          alert('Please select a user from the search results');
          return;
        }
        
        // Don't allow conversation with yourself
        if (participantId === currentUser?.id) {
          alert('Cannot create conversation with yourself');
          return;
        }
        
        await onCreateConversation([participantId], null, 'direct');
      } else {
        // Group conversation
        await onCreateConversation([], newConversationData.title, 'group');
      }
      
      setShowCreateDialog(false);
      setNewConversationData({
        type: 'direct',
        title: '',
        participantUsername: ''
      });
      setSearchResults([]);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation');
    }
  };

  const formatLastSeen = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h3>Conversations</h3>
        <button 
          className="new-chat-btn"
          onClick={() => setShowCreateDialog(true)}
          title="Start new conversation"
        >
          +
        </button>
      </div>

      <div className="conversations">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>No conversations yet</p>
            <p>Start a new conversation to begin chatting</p>
          </div>
        ) : (
          conversations.map(conversation => {
            const otherParticipant = conversation.participants?.find(p => p.id !== currentUser?.id);
            const isSelected = selectedConversation?.id === conversation.id;
            
            return (
              <div
                key={conversation.id}
                className={`conversation-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onConversationSelect(conversation)}
              >
                <div className="conversation-avatar">
                  {conversation.type === 'direct' && otherParticipant ? (
                    <div className="user-avatar">
                      <span>{otherParticipant.display_name?.charAt(0).toUpperCase()}</span>
                      {isUserOnline(otherParticipant.id) && <div className="online-indicator" />}
                    </div>
                  ) : (
                    <div className="group-avatar">
                      <span>{conversation.title?.charAt(0).toUpperCase() || 'G'}</span>
                    </div>
                  )}
                </div>

                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4 className="conversation-name">
                      {conversation.title || 
                       (otherParticipant?.display_name || 'Unknown User')}
                    </h4>
                    {conversation.last_message_at && (
                      <span className="last-message-time">
                        {formatLastSeen(conversation.last_message_at)}
                      </span>
                    )}
                  </div>

                  <div className="conversation-preview">
                    <p className="last-message">
                      {conversation.last_message || 'No messages yet'}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="unread-badge">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>

                  {conversation.type === 'direct' && otherParticipant && (
                    <div className="participant-status">
                      <span className={`status ${otherParticipant.status || 'offline'}`}>
                        {isUserOnline(otherParticipant.id) ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCreateDialog && (
        <div className="create-conversation-dialog">
          <div className="dialog-overlay" onClick={() => setShowCreateDialog(false)} />
          <div className="dialog-content">
            <h3>Start New Conversation</h3>
            
            <form onSubmit={handleCreateConversation}>
              <div className="form-group">
                <label>Conversation Type</label>
                <select
                  value={newConversationData.type}
                  onChange={(e) => setNewConversationData(prev => ({ 
                    ...prev, 
                    type: e.target.value 
                  }))}
                >
                  <option value="direct">Direct Message</option>
                  <option value="group">Group Chat</option>
                </select>
              </div>

              {newConversationData.type === 'direct' ? (
                <div className="form-group">
                  <label>Search User</label>
                  <input
                    type="text"
                    placeholder="Type username to search..."
                    value={newConversationData.participantUsername}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewConversationData(prev => ({ 
                        ...prev, 
                        participantUsername: value 
                      }));
                      handleUserSearch(value);
                      setSelectedUser(null);
                    }}
                    required
                  />
                  
                  <button 
                    type="button" 
                    onClick={() => handleUserSearch('bob')}
                    style={{ marginTop: '8px', padding: '4px 8px', fontSize: '12px' }}
                  >
                    Test Search 'bob'
                  </button>
                  
                  {selectedUser && (
                    <div className="selected-user">
                      <span>Selected: {selectedUser.display_name} (@{selectedUser.username})</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setSelectedUser(null);
                          setNewConversationData(prev => ({ ...prev, participantUsername: '' }));
                        }}
                        className="clear-selection"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  {isSearching && (
                    <div className="search-status">Searching...</div>
                  )}
                  
                  {searchResults.length > 0 && !selectedUser && (
                    <div className="search-results">
                      {searchResults.map(user => (
                        <div 
                          key={user.id} 
                          className="search-result-item"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewConversationData(prev => ({ 
                              ...prev, 
                              participantUsername: user.username 
                            }));
                            setSearchResults([]);
                          }}
                        >
                          <div className="user-avatar">
                            <span>{user.display_name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="user-info">
                            <div className="user-name">{user.display_name}</div>
                            <div className="username">@{user.username}</div>
                          </div>
                          <div className={`user-status ${user.status}`}>
                            {user.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {newConversationData.participantUsername && searchResults.length === 0 && !isSearching && !selectedUser && (
                    <div className="no-results">No users found</div>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label>Group Name</label>
                  <input
                    type="text"
                    placeholder="Enter group name"
                    value={newConversationData.title}
                    onChange={(e) => setNewConversationData(prev => ({ 
                      ...prev, 
                      title: e.target.value 
                    }))}
                    required
                  />
                </div>
              )}

              <div className="dialog-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="create-btn">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './UserProfile.css';

const UserProfile = ({ user, onClose }) => {
  const { updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.display_name || '',
    status: user?.status || 'online'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      
      await updateProfile(profileData);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const statusOptions = [
    { value: 'online', label: 'Online', color: '#4CAF50' },
    { value: 'away', label: 'Away', color: '#FF9800' },
    { value: 'offline', label: 'Offline', color: '#9E9E9E' }
  ];

  return (
    <div className="user-profile-overlay">
      <div className="user-profile-dialog">
        <div className="profile-header">
          <h2>Profile Settings</h2>
          <button 
            className="close-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              <span>
                {user?.display_name?.charAt(0).toUpperCase() || 
                 user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <button className="change-avatar-btn">
              Change Avatar
            </button>
          </div>

          <div className="profile-info-section">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="profile-edit-form">
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="displayName">Display Name</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={profileData.displayName}
                    onChange={handleInputChange}
                    placeholder="Enter your display name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={profileData.status}
                    onChange={handleInputChange}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        displayName: user?.display_name || '',
                        status: user?.status || 'online'
                      });
                      setError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-display">
                <div className="profile-field">
                  <label>Username</label>
                  <span>{user?.username}</span>
                </div>

                <div className="profile-field">
                  <label>Email</label>
                  <span>{user?.email}</span>
                </div>

                <div className="profile-field">
                  <label>Display Name</label>
                  <span>{user?.display_name || 'Not set'}</span>
                </div>

                <div className="profile-field">
                  <label>Status</label>
                  <div className="status-display">
                    <span 
                      className="status-dot"
                      style={{ 
                        backgroundColor: statusOptions.find(s => s.value === user?.status)?.color || '#9E9E9E'
                      }}
                    ></span>
                    <span>
                      {statusOptions.find(s => s.value === user?.status)?.label || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="profile-field">
                  <label>Member Since</label>
                  <span>
                    {user?.created_at ? 
                      new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'
                    }
                  </span>
                </div>

                <div className="profile-actions">
                  <button 
                    className="edit-profile-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-footer">
          <div className="app-info">
            <p>Messaging App v1.0</p>
            <p>Built with React & Node.js</p>
          </div>
          
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
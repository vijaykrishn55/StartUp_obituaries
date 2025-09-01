import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginForm.css';

const LoginForm = () => {
  const { login, register, error, isLoading, clearError } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isRegistering) {
      // Validation for registration
      if (!formData.username || !formData.email || !formData.password) {
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        return;
      }
      
      try {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName || formData.username
        });
      } catch (err) {
        console.error('Registration error:', err);
      }
    } else {
      // Login
      if (!formData.username || !formData.password) {
        return;
      }
      
      try {
        await login({
          username: formData.username,
          password: formData.password
        });
      } catch (err) {
        console.error('Login error:', err);
      }
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({
      username: '',
      email: '',
      password: '',
      displayName: '',
      confirmPassword: ''
    });
    if (error) clearError();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Messaging App</h1>
          <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <p>
            {isRegistering 
              ? 'Join the conversation and start messaging' 
              : 'Sign in to your account to continue'
            }
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
            />
          </div>

          {isRegistering && (
            <>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="displayName">Display Name (Optional)</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="How others will see you"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
              />
              {formData.password && formData.confirmPassword && 
               formData.password !== formData.confirmPassword && (
                <div className="field-error">Passwords do not match</div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading || (isRegistering && formData.password !== formData.confirmPassword)}
          >
            {isLoading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              className="toggle-btn"
              onClick={toggleMode}
            >
              {isRegistering ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>

        {/* Demo accounts info */}
        <div className="demo-info">
          <h4>Demo Accounts</h4>
          <p>You can use these pre-created accounts for testing:</p>
          <div className="demo-accounts">
            <div className="demo-account">
              <strong>alice</strong> / password123
            </div>
            <div className="demo-account">
              <strong>bob</strong> / password123
            </div>
            <div className="demo-account">
              <strong>charlie</strong> / password123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
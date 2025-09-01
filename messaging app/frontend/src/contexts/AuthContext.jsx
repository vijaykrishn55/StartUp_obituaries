import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import websocketService from '../services/websocket';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const ActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Logout function - defined first to avoid hoisting issues
  const logout = useCallback(async () => {
    try {
      // Call logout API
      await apiClient.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    }

    // Disconnect WebSocket
    websocketService.disconnect();

    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    dispatch({ type: ActionTypes.LOGOUT });
  }, []);

  // Initialize authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          const user = JSON.parse(userData);
          
          dispatch({
            type: ActionTypes.LOGIN_SUCCESS,
            payload: { user, token },
          });

          // Connect to WebSocket
          try {
            await websocketService.connect(token);
          } catch (wsError) {
            console.error('WebSocket connection failed:', wsError);
          }

          // Verify token is still valid
          try {
            const profileResponse = await apiClient.getProfile();
            dispatch({
              type: ActionTypes.UPDATE_USER,
              payload: profileResponse.user,
            });
          } catch (apiError) {
            // Token is invalid, logout
            logout();
          }
        } else {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };

    initAuth();
  }, [logout]);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: ActionTypes.LOGIN_START });

      const response = await apiClient.login(credentials);
      const { user, token } = response;

      // Store in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: { user, token },
      });

      // Connect to WebSocket
      try {
        await websocketService.connect(token);
      } catch (wsError) {
        console.error('WebSocket connection failed:', wsError);
      }

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({
        type: ActionTypes.LOGIN_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: ActionTypes.LOGIN_START });

      const response = await apiClient.register(userData);
      const { user, token } = response;

      // Store in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: { user, token },
      });

      // Connect to WebSocket
      try {
        await websocketService.connect(token);
      } catch (wsError) {
        console.error('WebSocket connection failed:', wsError);
      }

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      dispatch({
        type: ActionTypes.LOGIN_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };



  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await apiClient.updateProfile(profileData);
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: ActionTypes.UPDATE_USER,
        payload: response.user,
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Profile update failed';
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
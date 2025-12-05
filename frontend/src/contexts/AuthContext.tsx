import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'founder' | 'investor' | 'job-seeker' | 'mentor' | 'other';
  avatar?: string;
  bio?: string;
  headline?: string;
  role?: string;
  company?: string;
  location?: string;
  verified?: boolean;
  website?: string;
  twitter?: string;
  linkedIn?: string;
  github?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, userType: User['userType']) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        const storedToken = localStorage.getItem('auth_token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      const userData: User = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        userType: data.data.user.userType,
        avatar: data.data.user.avatar,
        bio: data.data.user.bio,
        company: data.data.user.company,
        location: data.data.user.location,
        verified: data.data.user.verified,
        website: data.data.user.website,
        twitter: data.data.user.twitter,
        linkedIn: data.data.user.linkedIn,
        github: data.data.user.github,
      };

      // Store in localStorage
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('refresh_token', data.data.refreshToken);
      
      setUser(userData);
      try {
        const s = getSocket();
        s.on('connect', () => {
          s.emit('join', userData.id);
        });
        s.on('new_message', (payload: any) => {
          console.log('New message received', payload);
          // Show toast notification
          toast.info('New message received', {
            description: 'You have a new message',
          });
          // Trigger notification badge update (could use a custom event or global state)
          window.dispatchEvent(new CustomEvent('new-message', { detail: payload }));
        });
        // If already connected, emit immediately
        if (s.connected) {
          s.emit('join', userData.id);
        }
      } catch (e) {
        console.warn('Socket connect failed on login');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    userType: User['userType']
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, userType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      const newUser: User = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        userType: data.data.user.userType,
        avatar: data.data.user.avatar,
        bio: data.data.user.bio,
        company: data.data.user.company,
        location: data.data.user.location,
        verified: false,
      };

      // Store in localStorage
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('refresh_token', data.data.refreshToken);
      
      setUser(newUser);
      try {
        const s = getSocket();
        s.on('connect', () => {
          s.emit('join', newUser.id);
        });
        s.on('new_message', (payload: any) => {
          console.log('New message received', payload);
          toast.info('New message received', {
            description: 'You have a new message',
          });
          window.dispatchEvent(new CustomEvent('new-message', { detail: payload }));
        });
        if (s.connected) {
          s.emit('join', newUser.id);
        }
      } catch (e) {
        console.warn('Socket connect failed on register');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    try { disconnectSocket(); } catch {}
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data?.user || data.user || data.data || data;
        const updatedUser: User = {
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          userType: userData.userType,
          avatar: userData.avatar,
          bio: userData.bio,
          company: userData.company,
          location: userData.location,
          verified: userData.verified,
          website: userData.website,
          twitter: userData.twitter,
          linkedIn: userData.linkedIn,
          github: userData.github,
        };
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export useAuth hook separately for better Fast Refresh support
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

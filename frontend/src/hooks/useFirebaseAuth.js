import { useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

const useFirebaseAuth = () => {
  const [authState, setAuthState] = useState({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthState(prev => ({ ...prev, loading: true }));

      if (firebaseUser) {
        try {
          // Try to fetch user profile from backend
          let response;
          try {
            response = await authAPI.getProfile();
          } catch (apiError) {
            console.log('Primary API call failed, trying fallback:', apiError);
            // Try fallback if main API fails
            response = await authAPI.getProfileFallback();
          }
          
          setAuthState({
            user: firebaseUser,
            profile: response.data.user,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          
          // For new users (especially Google sign-ups), treat profile fetch failures 
          // as incomplete registration since they need to complete their profile
          if (error.response?.status === 404 || 
              error.response?.status === 401 || 
              error.code === 'NETWORK_ERROR' ||
              !error.response) {
            setAuthState({
              user: firebaseUser,
              profile: null,
              loading: false,
              error: 'registration_incomplete',
            });
          } else {
            setAuthState({
              user: firebaseUser,
              profile: null,
              loading: false,
              error: 'profile_fetch_failed',
            });
          }
        }
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, password, userData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase profile
      await updateProfile(userCredential.user, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });
      
      // Complete registration in backend will be handled by auth state change
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Welcome!');
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
      toast.success('Logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUserProfile = async (data) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const response = await authAPI.updateProfile(data);
      setAuthState(prev => ({
        ...prev,
        profile: response.data.user,
        loading: false,
      }));
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  const completeRegistration = async (userData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Use the standard register endpoint with Firebase UID as a reference
      const firebaseUser = auth.currentUser;
      const response = await authAPI.register({
        username: userData.username,
        email: firebaseUser.email,
        password: `firebase-${Math.random().toString(36).slice(2, 10)}`, // Generate random password (won't be used)
        first_name: userData.firstName || userData.first_name,
        last_name: userData.lastName || userData.last_name,
        user_role: userData.userRole || 'student',
        is_recruiter: userData.isRecruiter || false,
        firebase_uid: firebaseUser.uid
      });
      
      setAuthState(prev => ({
        ...prev,
        profile: response.data.user,
        loading: false,
        error: null,
      }));
      toast.success('Registration completed!');
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...authState,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    completeRegistration,
  };
};

// Helper function to get user-friendly error messages
const getErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return error.message || 'An error occurred';
  }
};

export default useFirebaseAuth;
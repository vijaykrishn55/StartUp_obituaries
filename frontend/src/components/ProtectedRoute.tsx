import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: Array<'founder' | 'investor' | 'job-seeker' | 'mentor' | 'other'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedUserTypes 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
    // Redirect to appropriate dashboard based on user type
    const dashboardRoute = user.userType === 'investor' ? '/investor-dashboard' : '/dashboard';
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
};

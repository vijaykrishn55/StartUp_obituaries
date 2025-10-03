import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import ErrorBoundary from './components/ErrorBoundary'
import FirebaseAuthProvider from './components/FirebaseAuthProvider'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CompleteRegistrationPage from './pages/CompleteRegistrationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import CreateStartupPage from './pages/CreateStartupPage'
import StartupDetailPage from './pages/StartupDetailPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardsPage from './pages/LeaderboardsPage'
import ConnectionsPage from './pages/ConnectionsPage'
import MessagesPage from './pages/MessagesPage'
import MyStartupsPage from './pages/MyStartupsPage'
import AdminPage from './pages/AdminPage'
import AnalyticsPage from './pages/AnalyticsPage'

function App() {
  const { user, profile, error, isLoading } = useAuthStore()

  // Show loading spinner while Firebase is initializing
  if (isLoading) {
    return (
      <FirebaseAuthProvider>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </FirebaseAuthProvider>
    )
  }

  // If user is authenticated but needs to complete registration
  if (user && (error === 'registration_incomplete' || error === 'profile_fetch_failed')) {
    return (
      <FirebaseAuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
            <Route path="*" element={<Navigate to="/complete-registration" />} />
          </Routes>
        </ErrorBoundary>
      </FirebaseAuthProvider>
    )
  }

  return (
    <FirebaseAuthProvider>
      <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user && profile ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={user && profile ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user && profile ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/complete-registration" element={user ? <CompleteRegistrationPage /> : <Navigate to="/login" />} />
        <Route path="/forgot-password" element={user && profile ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} />
        <Route path="/reset-password" element={user && profile ? <Navigate to="/dashboard" /> : <ResetPasswordPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={user && profile ? <Layout /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="create" element={<CreateStartupPage />} />
          <Route path="my-startups" element={<MyStartupsPage />} />
          <Route path="startup/:id" element={<StartupDetailPage />} />
          <Route path="profile/:userId?" element={<ProfilePage />} />
          <Route path="leaderboards" element={<LeaderboardsPage />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
    </FirebaseAuthProvider>
  )
}

export default App

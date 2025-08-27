import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CreateStartupPage from './pages/CreateStartupPage'
import StartupDetailPage from './pages/StartupDetailPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardsPage from './pages/LeaderboardsPage'
import ConnectionsPage from './pages/ConnectionsPage'
import MessagesPage from './pages/MessagesPage'
import MyStartupsPage from './pages/MyStartupsPage'

function App() {
  const { user, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      
      {/* Protected routes */}
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="create" element={<CreateStartupPage />} />
        <Route path="my-startups" element={<MyStartupsPage />} />
        <Route path="startup/:id" element={<StartupDetailPage />} />
        <Route path="profile/:userId?" element={<ProfilePage />} />
        <Route path="leaderboards" element={<LeaderboardsPage />} />
        <Route path="connections" element={<ConnectionsPage />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>
    </Routes>
  )
}

export default App

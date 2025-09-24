import { useAuthStore } from '../../stores/authStore'
import FounderDashboard from './FounderDashboard'
import StudentDashboard from './StudentDashboard'
import InvestorDashboard from './InvestorDashboard'
import RecruiterDashboard from './RecruiterDashboard'
import LoadingSpinner from '../LoadingSpinner'

export default function DashboardRouter() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  // Determine dashboard type based on user role and context
  const getDashboardComponent = () => {
    // Check if user is a founder (has created startups) or team member
    // This logic can be enhanced when we have team membership data
    const isFounderOrTeamMember = user.user_role === 'founder' || user.created_startups?.length > 0

    switch (user.user_role) {
      case 'founder':
        return <FounderDashboard />
      case 'investor':
        return <InvestorDashboard />
      case 'recruiter':
        return <RecruiterDashboard />
      case 'student':
      default:
        // If user is a student but has startup experience, show founder dashboard
        return isFounderOrTeamMember ? <FounderDashboard /> : <StudentDashboard />
    }
  }

  return getDashboardComponent()
}

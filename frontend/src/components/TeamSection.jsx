import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UserGroupIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  UserCircleIcon,
  BriefcaseIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { teamAPI } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'

export default function TeamSection({ startupId, isOwner }) {
  const [teamMembers, setTeamMembers] = useState([])
  const [joinRequests, setJoinRequests] = useState([])
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [joinFormData, setJoinFormData] = useState({
    role_title: '',
    tenure_start_year: '',
    tenure_end_year: '',
    message: ''
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    loadTeamData()
  }, [startupId])

  const loadTeamData = async () => {
    try {
      const [teamResponse, requestsResponse] = await Promise.all([
        teamAPI.getTeamMembers(startupId),
        isOwner ? teamAPI.getJoinRequests(startupId) : Promise.resolve({ data: { requests: [] } })
      ])
      
      setTeamMembers(teamResponse.data.teamMembers || [])
      setJoinRequests(requestsResponse.data.requests || requestsResponse.data || [])
    } catch (error) {
      console.error('Failed to load team data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRequest = async (e) => {
    e.preventDefault()
    try {
      await teamAPI.requestToJoin(startupId, joinFormData)
      setShowJoinForm(false)
      setJoinFormData({
        role_title: '',
        tenure_start_year: '',
        tenure_end_year: '',
        message: ''
      })
      // Reload data to show the new request
      loadTeamData()
    } catch (error) {
      console.error('Failed to send join request:', error)
      alert('Failed to send join request. Please try again.')
    }
  }

  const handleRequestResponse = async (requestId, status) => {
    try {
      await teamAPI.respondToJoinRequest(requestId, status)
      loadTeamData()
    } catch (error) {
      console.error('Failed to respond to request:', error)
    }
  }

  const isUserInTeam = Array.isArray(teamMembers) && teamMembers.some(member => member.user_id === user?.id)
  const hasPendingRequest = Array.isArray(joinRequests) && joinRequests.some(request => 
    request.user_id === user?.id && request.status === 'pending'
  )

  if (loading) {
    return (
      <div className={cn("card")}>
        <div className={cn("animate-pulse")}>
          <div className={cn("h-6 bg-gray-200 rounded w-1/3 mb-4")}></div>
          <div className={cn("space-y-3")}>
            <div className={cn("h-4 bg-gray-200 rounded")}></div>
            <div className={cn("h-4 bg-gray-200 rounded w-2/3")}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("card")}>
      <div className={cn("flex items-center justify-between mb-6")}>
        <h2 className={cn("text-xl font-bold text-gray-900 flex items-center")}>
          <UserGroupIcon className={cn("h-6 w-6 mr-2")} />
          Team Members ({teamMembers.length})
        </h2>
        
        {user && !isOwner && !isUserInTeam && !hasPendingRequest && (
          <button
            onClick={() => setShowJoinForm(true)}
            className={cn("btn-primary flex items-center")}
          >
            <PlusIcon className={cn("h-4 w-4 mr-1")} />
            Request to Join
          </button>
        )}
      </div>

      {/* Join request form */}
      {showJoinForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={cn("mb-6 p-4 border border-gray-200 rounded-lg")}
        >
          <h3 className={cn("text-lg font-medium text-gray-900 mb-4")}>Request to Join Team</h3>
          <form onSubmit={handleJoinRequest} className={cn("space-y-4")}>
            <div>
              <label className={cn("block text-sm font-medium text-gray-700 mb-1")}>
                Role Title *
              </label>
              <input
                type="text"
                value={joinFormData.role_title}
                onChange={(e) => setJoinFormData(prev => ({ ...prev, role_title: e.target.value }))}
                className={cn("input")}
                placeholder="e.g., Co-founder, CTO, Lead Developer"
                required
              />
            </div>
            
            <div className={cn("grid grid-cols-2 gap-4")}>
              <div>
                <label className={cn("block text-sm font-medium text-gray-700 mb-1")}>
                  Start Year
                </label>
                <input
                  type="number"
                  value={joinFormData.tenure_start_year}
                  onChange={(e) => setJoinFormData(prev => ({ ...prev, tenure_start_year: e.target.value }))}
                  className={cn("input")}
                  placeholder="2020"
                />
              </div>
              <div>
                <label className={cn("block text-sm font-medium text-gray-700 mb-1")}>
                  End Year
                </label>
                <input
                  type="number"
                  value={joinFormData.tenure_end_year}
                  onChange={(e) => setJoinFormData(prev => ({ ...prev, tenure_end_year: e.target.value }))}
                  className={cn("input")}
                  placeholder="2023"
                />
              </div>
            </div>
            
            <div>
              <label className={cn("block text-sm font-medium text-gray-700 mb-1")}>
                Message (Optional)
              </label>
              <textarea
                value={joinFormData.message}
                onChange={(e) => setJoinFormData(prev => ({ ...prev, message: e.target.value }))}
                className={cn("input")}
                rows={3}
                placeholder="Describe your role and contributions..."
              />
            </div>
            
            <div className={cn("flex space-x-3")}>
              <button type="submit" className={cn("btn-primary")}>
                Send Request
              </button>
              <button
                type="button"
                onClick={() => setShowJoinForm(false)}
                className={cn("btn-outline")}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Pending request notification */}
      {hasPendingRequest && (
        <div className={cn("mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg")}>
          <div className={cn("flex items-center")}>
            <CalendarIcon className={cn("h-5 w-5 text-yellow-600 mr-2")} />
            <span className={cn("text-yellow-800")}>Your request to join this team is pending approval.</span>
          </div>
        </div>
      )}

      {/* Team members list */}
      {teamMembers.length === 0 ? (
        <div className={cn("text-center py-8")}>
          <UserGroupIcon className={cn("h-12 w-12 text-gray-300 mx-auto mb-4")} />
          <h3 className={cn("text-lg font-medium text-gray-900 mb-2")}>No team members yet</h3>
          <p className={cn("text-gray-600")}>
            {isOwner ? 'Team members will appear here once they join.' : 'Be the first to request joining this team!'}
          </p>
        </div>
      ) : (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4")}>
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("border border-gray-200 rounded-lg p-4")}
            >
              <div className={cn("flex items-start space-x-3")}>
                <UserCircleIcon className={cn("h-10 w-10 text-gray-400")} />
                <div className={cn("flex-1")}>
                  <h4 className={cn("font-medium text-gray-900")}>
                    {member.user_name || 'Anonymous'}
                  </h4>
                  
                  <div className={cn("flex items-center text-sm text-gray-600 mt-1")}>
                    <BriefcaseIcon className={cn("h-4 w-4 mr-1")} />
                    {member.role_title}
                  </div>
                  
                  {(member.tenure_start_year || member.tenure_end_year) && (
                    <div className={cn("flex items-center text-sm text-gray-600 mt-1")}>
                      <CalendarIcon className={cn("h-4 w-4 mr-1")} />
                      {member.tenure_start_year || '?'} - {member.tenure_end_year || '?'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Join requests (owner only) */}
      {isOwner && joinRequests.length > 0 && (
        <div className={cn("mt-8 pt-6 border-t border-gray-200")}>
          <h3 className={cn("text-lg font-medium text-gray-900 mb-4")}>
            Pending Join Requests ({joinRequests.filter(r => r.status === 'pending').length})
          </h3>
          
          <div className={cn("space-y-4")}>
            {joinRequests
              .filter(request => request.status === 'pending')
              .map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("border border-gray-200 rounded-lg p-4")}
                >
                  <div className={cn("flex items-start justify-between")}>
                    <div className={cn("flex items-start space-x-3")}>
                      <UserCircleIcon className={cn("h-10 w-10 text-gray-400")} />
                      <div>
                        <h4 className={cn("font-medium text-gray-900")}>
                          {request.user_name}
                        </h4>
                        <div className={cn("text-sm text-gray-600")}>
                          Wants to join as: <span className={cn("font-medium")}>{request.role_title}</span>
                        </div>
                        {(request.tenure_start_year || request.tenure_end_year) && (
                          <div className={cn("text-sm text-gray-600")}>
                            Tenure: {request.tenure_start_year || '?'} - {request.tenure_end_year || '?'}
                          </div>
                        )}
                        {request.message && (
                          <p className={cn("text-sm text-gray-600 mt-2 italic")}>
                            "{request.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className={cn("flex space-x-2")}>
                      <button
                        onClick={() => handleRequestResponse(request.id, 'approved')}
                        className={cn("btn bg-green-600 text-white hover:bg-green-700 flex items-center")}
                      >
                        <CheckIcon className={cn("h-4 w-4 mr-1")} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestResponse(request.id, 'rejected')}
                        className={cn("btn bg-red-600 text-white hover:bg-red-700 flex items-center")}
                      >
                        <XMarkIcon className={cn("h-4 w-4 mr-1")} />
                        Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import { startupsAPI } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import { cn, formatCurrency, formatDate } from '../lib/utils'

export default function MyStartupsPage() {
  const [startups, setStartups] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    loadMyStartups()
  }, [])

  const loadMyStartups = async () => {
    try {
      const response = await startupsAPI.getStartups({ created_by: user.id })
      setStartups(response.data || [])
    } catch (error) {
      console.error('Failed to load startups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStartup = async (startupId) => {
    if (!confirm('Are you sure you want to delete this startup? This action cannot be undone.')) {
      return
    }

    try {
      await startupsAPI.deleteStartup(startupId)
      setStartups(prev => prev.filter(startup => startup.id !== startupId))
    } catch (error) {
      console.error('Failed to delete startup:', error)
      alert('Failed to delete startup. Please try again.')
    }
  }


  const getYearsActive = (startup) => {
    if (!startup.founded_year || !startup.died_year) return null
    return startup.died_year - startup.founded_year
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your startups..." />
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Startup Stories</h1>
            <p className="mt-2 text-gray-600">
              Manage your shared startup experiences and help others learn from your journey
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/create" className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Share New Story
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{startups.length}</div>
          <div className="text-sm text-gray-600">Stories Shared</div>
        </div>
        
        <div className="card text-center">
          <EyeIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {startups.reduce((sum, s) => sum + (s.views || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        
        <div className="card text-center">
          <CurrencyDollarIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(startups.reduce((sum, s) => sum + (s.funding_amount_usd || 0), 0))}
          </div>
          <div className="text-sm text-gray-600">Total Funding</div>
        </div>
      </div>

      {/* Startups List */}
      {startups.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No startup stories yet</h3>
          <p className="text-gray-600 mb-6">
            Share your first startup story and help others learn from your experience
          </p>
          <Link to="/create" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Share Your First Story
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {startups.map((startup, index) => (
            <motion.div
              key={startup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{startup.name}</h3>
                    {startup.is_anonymous && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        Anonymous
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                      {startup.industry}
                    </div>
                    
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {startup.founded_year} - {startup.died_year} ({getYearsActive(startup)} years)
                    </div>
                    
                    {startup.funding_amount_usd && (
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        {formatCurrency(startup.funding_amount_usd)}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {startup.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>💀 {startup.primary_failure_reason}</span>
                    <span>👀 {startup.views || 0} views</span>
                    <span>❤️ {startup.reactions_count || 0} reactions</span>
                    <span>💬 {startup.comments_count || 0} comments</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-6">
                  <Link
                    to={`/startup/${startup.id}`}
                    className="btn-outline flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Link>
                  
                  <Link
                    to={`/startup/${startup.id}/edit`}
                    className="btn-outline flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteStartup(startup.id)}
                    className="btn text-red-600 border-red-300 hover:bg-red-50 flex items-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Progress indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{startup.views || 0}</div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{startup.reactions_count || 0}</div>
                  <div className="text-xs text-gray-500">Reactions</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{startup.comments_count || 0}</div>
                  <div className="text-xs text-gray-500">Comments</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

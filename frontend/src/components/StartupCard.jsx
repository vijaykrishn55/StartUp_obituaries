import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  CalendarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  FlagIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolidIcon,
  ChatBubbleLeftIcon as ChatSolidIcon,
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  ArrowPathIcon as ArrowPathSolidIcon
} from '@heroicons/react/24/solid'
import { cn, getFailureReasonCardStyle, formatCurrency, formatDate } from '../lib/utils'
import { reactionTypes } from '../lib/constants'
import { reactionsAPI } from '../lib/api'
import ReportModal from './ReportModal'

const stageColors = {
  'Idea': 'bg-gray-100 text-gray-800',
  'Pre-seed': 'bg-blue-100 text-blue-800',
  'Seed': 'bg-green-100 text-green-800',
  'Series A': 'bg-orange-100 text-orange-800',
  'Series B+': 'bg-red-100 text-red-800',
}

export default function StartupCard({ startup, featured = false, onReactionUpdate }) {
  const [reactions, setReactions] = useState({
    upvotes: startup.upvotes || startup.upvote_count || 0,
    downvotes: startup.downvotes || startup.downvote_count || 0,
    pivot: startup.pivot || startup.pivot_count || 0
  })
  const [userReaction, setUserReaction] = useState(null)
  const [isReacting, setIsReacting] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const handleReaction = async (type, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isReacting) return
    setIsReacting(true)
    
    try {
      if (userReaction === type) {
        await reactionsAPI.removeReaction(startup.id, type)
        setUserReaction(null)
        setReactions(prev => ({
          ...prev,
          [type === 'upvote' ? 'upvotes' : type === 'downvote' ? 'downvotes' : 'pivot']: 
            prev[type === 'upvote' ? 'upvotes' : type === 'downvote' ? 'downvotes' : 'pivot'] - 1
        }))
      } else {
        const response = await reactionsAPI.addReaction(startup.id, type)
        setUserReaction(type)
        setReactions(response.data)
      }
      
      if (onReactionUpdate) {
        onReactionUpdate(startup.id, {
          upvotes: reactions.upvotes,
          downvotes: reactions.downvotes,
          pivot: reactions.pivot
        })
      }
    } catch (error) {
      console.error('Failed to update reaction:', error)
    } finally {
      setIsReacting(false)
    }
  }

  const getYearsActive = () => {
    if (!startup.founded_year || !startup.died_year) return null
    return startup.died_year - startup.founded_year
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'card-hover transition-all duration-200',
        featured && 'border-primary-200 bg-gradient-to-br from-primary-50 to-white'
      )}
    >
      {featured && (
        <div className="flex items-center mb-4">
          <div className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
            Featured Story
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          {startup.logo_url ? (
            <img
              src={`http://localhost:3000${startup.logo_url}`}
              alt={`${startup.name} logo`}
              className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {startup.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <Link 
              to={`/startup/${startup.id}`}
              className="block group"
            >
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                {startup.name}
              </h3>
            </Link>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              {startup.industry || 'Unknown Industry'}
            </div>
            
            {startup.founded_year && startup.died_year && (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {startup.founded_year} - {startup.died_year} ({getYearsActive()} years)
              </div>
            )}
            
            {startup.stage_at_death && (
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                stageColors[startup.stage_at_death]
              )}>
                {startup.stage_at_death}
              </span>
            )}
            </div>
          </div>
        </div>

        {startup.funding_amount_usd && (
          <div className="text-right">
            <div className="flex items-center text-gray-600">
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              <span className="font-medium">{formatCurrency(startup.funding_amount_usd)}</span>
            </div>
            <div className="text-xs text-gray-500">Total Funding</div>
          </div>
        )}
      </div>

      {startup.description && (
        <p className="text-gray-600 mb-4 line-clamp-3">
          {startup.description}
        </p>
      )}

      {/* Failure Reason */}
      <div className="mb-4">
        <span className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          getFailureReasonCardStyle(startup.primary_failure_reason)
        )}>
          💀 {startup.primary_failure_reason}
        </span>
      </div>

      {/* Lessons Preview */}
      {startup.lessons_learned && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Key Lesson</h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {startup.lessons_learned}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Reactions */}
          <div className="flex items-center space-x-3 text-sm">
            {/* Upvote */}
            <button
              onClick={(e) => handleReaction('upvote', e)}
              disabled={isReacting}
              className={cn(
                'flex items-center space-x-1 px-2 py-1 rounded-md transition-colors',
                userReaction === 'upvote'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
              )}
            >
              {userReaction === 'upvote' ? (
                <HandThumbUpSolidIcon className="h-4 w-4" />
              ) : (
                <HandThumbUpIcon className="h-4 w-4" />
              )}
              {reactions.upvotes > 0 && <span>{reactions.upvotes}</span>}
            </button>

            {/* Pivot */}
            <button
              onClick={(e) => handleReaction('pivot', e)}
              disabled={isReacting}
              className={cn(
                'flex items-center space-x-1 px-2 py-1 rounded-md transition-colors',
                userReaction === 'pivot'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
              )}
            >
              {userReaction === 'pivot' ? (
                <ArrowPathSolidIcon className="h-4 w-4" />
              ) : (
                <ArrowPathIcon className="h-4 w-4" />
              )}
              {reactions.pivot > 0 && <span>{reactions.pivot}</span>}
            </button>

            {/* Downvote */}
            <button
              onClick={(e) => handleReaction('downvote', e)}
              disabled={isReacting}
              className={cn(
                'flex items-center space-x-1 px-2 py-1 rounded-md transition-colors',
                userReaction === 'downvote'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
              )}
            >
              {userReaction === 'downvote' ? (
                <HandThumbDownSolidIcon className="h-4 w-4" />
              ) : (
                <HandThumbDownIcon className="h-4 w-4" />
              )}
              {reactions.downvotes > 0 && <span>{reactions.downvotes}</span>}
            </button>

            {/* Comments */}
            {startup.comment_count > 0 && (
              <div className="flex items-center space-x-1 text-gray-500">
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span>{startup.comment_count}</span>
              </div>
            )}
          </div>

          {/* Team Size */}
          {startup.team_size && (
            <div className="flex items-center text-gray-500">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">{startup.team_size} team members</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>By {startup.creator_username || 'Anonymous'}</span>
            <span>•</span>
            <span>{formatDate(startup.created_at)}</span>
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowReportModal(true)
            }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Report this startup"
          >
            <FlagIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Anonymous indicator */}
      {startup.is_anonymous && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
          Posted anonymously
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="startup"
        targetId={startup.id}
        targetName={startup.name}
      />
    </motion.div>
  )
}

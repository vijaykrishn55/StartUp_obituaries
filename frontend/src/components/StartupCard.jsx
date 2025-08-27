import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CalendarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolidIcon,
  ChatBubbleLeftIcon as ChatSolidIcon
} from '@heroicons/react/24/solid'
import { clsx } from 'clsx'

const failureReasonColors = {
  'Ran out of funding': 'bg-red-100 text-red-800',
  'No Product-Market Fit': 'bg-orange-100 text-orange-800',
  'Poor Unit Economics': 'bg-yellow-100 text-yellow-800',
  'Co-founder Conflict': 'bg-purple-100 text-purple-800',
  'Technical Debt': 'bg-blue-100 text-blue-800',
  'Got outcompeted': 'bg-gray-100 text-gray-800',
  'Bad Timing': 'bg-green-100 text-green-800',
  'Legal/Regulatory Issues': 'bg-indigo-100 text-indigo-800',
  'Pivot Fatigue': 'bg-pink-100 text-pink-800',
  'Other': 'bg-gray-100 text-gray-800',
}

const stageColors = {
  'Idea': 'bg-gray-100 text-gray-800',
  'Pre-seed': 'bg-blue-100 text-blue-800',
  'Seed': 'bg-green-100 text-green-800',
  'Series A': 'bg-orange-100 text-orange-800',
  'Series B+': 'bg-red-100 text-red-800',
}

export default function StartupCard({ startup, featured = false }) {
  const formatCurrency = (amount) => {
    if (!amount) return 'Undisclosed'
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
      className={clsx(
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
              <span className={clsx(
                'px-2 py-1 rounded-full text-xs font-medium',
                stageColors[startup.stage_at_death]
              )}>
                {startup.stage_at_death}
              </span>
            )}
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
        <span className={clsx(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          failureReasonColors[startup.primary_failure_reason] || 'bg-gray-100 text-gray-800'
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
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span className="text-lg">💡</span>
              <span>{startup.brilliant_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-lg">🪦</span>
              <span>{startup.rip_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>{startup.comment_count || 0}</span>
            </div>
          </div>

          {/* Team Size */}
          {startup.team_size && (
            <div className="flex items-center text-gray-500">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">{startup.team_size} team members</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>By {startup.creator_name || 'Anonymous'}</span>
          <span>•</span>
          <span>{formatDate(startup.created_at)}</span>
        </div>
      </div>

      {/* Anonymous indicator */}
      {startup.is_anonymous && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
          Posted anonymously
        </div>
      )}
    </motion.div>
  )
}

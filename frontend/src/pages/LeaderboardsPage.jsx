import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrophyIcon,
  FireIcon,
  LightBulbIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { leaderboardsAPI } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { clsx } from 'clsx'

const leaderboardTypes = [
  {
    id: 'most-tragic',
    name: 'Most Tragic',
    description: 'The most heartbreaking startup failures',
    icon: TrophyIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    id: 'deserved-pivot',
    name: 'Deserved Pivot',
    description: 'Startups that should have pivoted sooner',
    icon: ArrowPathIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'brilliant-mistakes',
    name: 'Brilliant Mistakes',
    description: 'Failures that taught valuable lessons',
    icon: LightBulbIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    id: 'most-funded-failures',
    name: 'Most Funded Failures',
    description: 'Biggest money burns in startup history',
    icon: CurrencyDollarIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
]

export default function LeaderboardsPage() {
  const [activeLeaderboard, setActiveLeaderboard] = useState('most-tragic')
  const [leaderboardData, setLeaderboardData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllLeaderboards()
  }, [])

  const loadAllLeaderboards = async () => {
    try {
      const [tragic, pivot, brilliant, funded] = await Promise.all([
        leaderboardsAPI.getMostTragic().catch(() => ({ data: { startups: [] } })),
        leaderboardsAPI.getDeservedPivot().catch(() => ({ data: { startups: [] } })),
        leaderboardsAPI.getBrilliantMistakes().catch(() => ({ data: { startups: [] } })),
        leaderboardsAPI.getMostFundedFailures().catch(() => ({ data: { startups: [] } }))
      ])

      setLeaderboardData({
        'most-tragic': tragic.data.startups || tragic.data || [],
        'deserved-pivot': pivot.data.startups || pivot.data || [],
        'brilliant-mistakes': brilliant.data.startups || brilliant.data || [],
        'most-funded-failures': funded.data.startups || funded.data || []
      })
    } catch (error) {
      console.error('Failed to load leaderboards:', error)
      setLeaderboardData({
        'most-tragic': [],
        'deserved-pivot': [],
        'brilliant-mistakes': [],
        'most-funded-failures': []
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'Undisclosed'
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  const getMetricValue = (startup, type) => {
    switch (type) {
      case 'most-tragic':
        return `${startup.reaction_count || startup.tragic_count || 0} 🪦`
      case 'deserved-pivot':
        return `${startup.pivot_count || startup.reaction_count || 0} 🔁`
      case 'brilliant-mistakes':
        return `${startup.brilliant_count || startup.reaction_count || 0} 💡`
      case 'most-funded-failures':
        return formatCurrency(startup.total_funding_amount || startup.funding_amount || 0)
      default:
        return ''
    }
  }

  const currentLeaderboard = leaderboardTypes.find(lb => lb.id === activeLeaderboard)
  const currentData = leaderboardData[activeLeaderboard] || []

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading leaderboards..." />
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Startup Failure Leaderboards</h1>
        <p className="text-gray-600">
          Celebrating the most memorable startup failures and the lessons they taught us
        </p>
      </div>

      {/* Leaderboard Tabs */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaderboardTypes.map((leaderboard) => (
            <motion.button
              key={leaderboard.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveLeaderboard(leaderboard.id)}
              className={clsx(
                'p-4 rounded-lg border-2 text-left transition-all duration-200',
                activeLeaderboard === leaderboard.id
                  ? `${leaderboard.bgColor} ${leaderboard.borderColor} ${leaderboard.color}`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-center space-x-3 mb-2">
                <leaderboard.icon className={clsx(
                  'h-6 w-6',
                  activeLeaderboard === leaderboard.id ? leaderboard.color : 'text-gray-400'
                )} />
                <h3 className={clsx(
                  'font-medium',
                  activeLeaderboard === leaderboard.id ? leaderboard.color : 'text-gray-900'
                )}>
                  {leaderboard.name}
                </h3>
              </div>
              <p className={clsx(
                'text-sm',
                activeLeaderboard === leaderboard.id ? leaderboard.color : 'text-gray-600'
              )}>
                {leaderboard.description}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                {(leaderboardData[leaderboard.id] || []).length} entries
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Current Leaderboard */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <currentLeaderboard.icon className={`h-8 w-8 ${currentLeaderboard.color}`} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentLeaderboard.name}</h2>
            <p className="text-gray-600">{currentLeaderboard.description}</p>
          </div>
        </div>

        {currentData.length === 0 ? (
          <div className="text-center py-12">
            <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-600">This leaderboard will populate as more startups are shared.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentData.map((startup, index) => (
              <motion.div
                key={startup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={clsx(
                  'flex items-center space-x-4 p-4 rounded-lg border',
                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                )}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  <span className="text-2xl font-bold">
                    {getRankIcon(index + 1)}
                  </span>
                </div>

                {/* Startup Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{startup.name}</h3>
                      <p className="text-sm text-gray-600">{startup.industry}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {startup.founded_year} - {startup.died_year}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-bold ${currentLeaderboard.color}`}>
                        {getMetricValue(startup, activeLeaderboard)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {activeLeaderboard === 'most-tragic' && 'RIP Votes'}
                        {activeLeaderboard === 'deserved-pivot' && 'Pivot Votes'}
                        {activeLeaderboard === 'brilliant-mistakes' && 'Brilliant Votes'}
                        {activeLeaderboard === 'most-funded-failures' && 'Total Funding'}
                      </div>
                    </div>
                  </div>

                  {/* Failure Reason */}
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      💀 {startup.primary_failure_reason}
                    </span>
                  </div>

                  {/* Description */}
                  {startup.description && (
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {startup.description}
                    </p>
                  )}

                  {/* Key Lesson */}
                  {startup.lessons_learned && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Key Lesson</h4>
                      <p className="text-sm text-blue-700 line-clamp-2">
                        {startup.lessons_learned}
                      </p>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <div className="flex-shrink-0">
                  <a
                    href={`/startup/${startup.id}`}
                    className="btn-outline text-sm"
                  >
                    View Story
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {leaderboardTypes.map((leaderboard) => {
          const data = leaderboardData[leaderboard.id] || []
          const topEntry = data[0]
          
          return (
            <div key={leaderboard.id} className="card text-center">
              <leaderboard.icon className={`h-8 w-8 ${leaderboard.color} mx-auto mb-2`} />
              <h3 className="font-medium text-gray-900 mb-1">{leaderboard.name}</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {data.length}
              </div>
              <div className="text-sm text-gray-600">Total Entries</div>
              
              {topEntry && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">Current Leader</div>
                  <div className="font-medium text-gray-900 truncate">
                    {topEntry.name}
                  </div>
                  <div className={`text-sm ${leaderboard.color}`}>
                    {getMetricValue(topEntry, leaderboard.id)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

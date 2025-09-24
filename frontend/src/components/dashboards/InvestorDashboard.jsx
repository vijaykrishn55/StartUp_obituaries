import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  UserGroupIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../lib/utils'
import { startupsAPI } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import LoadingSpinner from '../LoadingSpinner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function InvestorDashboard() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [startups, setStartups] = useState([])
  const [marketInsights, setMarketInsights] = useState({
    totalFunding: 0,
    avgFunding: 0,
    successfulPivots: 0,
    riskFactors: []
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const startupsRes = await startupsAPI.getStartups()
      const allStartups = startupsRes.data.startups || []
      setStartups(allStartups)

      // Calculate market insights
      const fundedStartups = allStartups.filter(s => s.funding_amount_usd > 0)
      const totalFunding = fundedStartups.reduce((sum, s) => sum + (s.funding_amount_usd || 0), 0)
      const avgFunding = fundedStartups.length > 0 ? totalFunding / fundedStartups.length : 0
      const successfulPivots = allStartups.filter(s => s.pivot_count > 0).length

      // Risk factor analysis
      const riskCounts = {}
      allStartups.forEach(startup => {
        const risk = startup.primary_failure_reason || 'Unknown'
        riskCounts[risk] = (riskCounts[risk] || 0) + 1
      })

      const riskFactors = Object.entries(riskCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([risk, count]) => ({ 
          risk, 
          count, 
          percentage: ((count / allStartups.length) * 100).toFixed(1)
        }))

      setMarketInsights({
        totalFunding,
        avgFunding,
        successfulPivots,
        riskFactors
      })

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHighPotentialStartups = () => {
    return startups
      .filter(s => s.funding_amount_usd > 0 && s.lessons_learned)
      .sort((a, b) => (b.funding_amount_usd || 0) - (a.funding_amount_usd || 0))
      .slice(0, 6)
  }

  const getFoundersToWatch = () => {
    // Get founders with multiple startups or high engagement
    const founderMap = {}
    startups.forEach(startup => {
      const founderId = startup.created_by_user_id
      const founder = startup.creator_username
      if (!founderMap[founderId]) {
        founderMap[founderId] = {
          id: founderId,
          name: founder,
          startups: [],
          totalFunding: 0,
          totalEngagement: 0
        }
      }
      founderMap[founderId].startups.push(startup)
      founderMap[founderId].totalFunding += startup.funding_amount_usd || 0
      founderMap[founderId].totalEngagement += (startup.upvote_count || 0) + (startup.comment_count || 0)
    })

    return Object.values(founderMap)
      .filter(f => f.startups.length > 0)
      .sort((a, b) => (b.totalFunding + b.totalEngagement) - (a.totalFunding + a.totalEngagement))
      .slice(0, 5)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Investment Intelligence 💰
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Analyze market patterns, identify opportunities, and learn from startup failures 
            to make better investment decisions
          </p>
        </div>
      </motion.div>

      {/* Market Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Total Funding Lost</p>
                <p className="text-2xl font-bold text-emerald-900">
                  ${marketInsights.totalFunding > 0 ? (marketInsights.totalFunding / 1000000).toFixed(1) : '0.0'}M
                </p>
              </div>
              <div className="p-3 bg-emerald-200 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Avg Funding</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${marketInsights.avgFunding > 0 ? (marketInsights.avgFunding / 1000).toFixed(0) : '0'}K
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Pivot Attempts</p>
                <p className="text-2xl font-bold text-purple-900">{marketInsights.successfulPivots}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Risk Patterns</p>
                <p className="text-2xl font-bold text-orange-900">{marketInsights.riskFactors.length}</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* High-Potential Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <StarIcon className="h-5 w-5 mr-2 text-yellow-500" />
                    High-Potential Case Studies
                  </CardTitle>
                  <CardDescription>
                    Well-funded startups with valuable lessons learned
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <FunnelIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getHighPotentialStartups().map((startup) => (
                  <motion.div
                    key={startup.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Link to={`/startup/${startup.id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {startup.name}
                        </h4>
                        <Badge variant="success" size="sm">
                          ${(startup.funding_amount_usd / 1000).toFixed(0)}K
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {startup.industry} • {startup.stage_at_death}
                      </p>
                      <p className="text-xs text-gray-700 mb-3 line-clamp-2">
                        <strong>Lesson:</strong> {startup.lessons_learned?.substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="danger" size="sm">
                          {startup.primary_failure_reason}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {startup.founded_year}-{startup.died_year}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Founders to Watch */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
                Founders to Watch
              </CardTitle>
              <CardDescription>
                Entrepreneurs with track records worth monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getFoundersToWatch().map((founder, index) => (
                  <motion.div
                    key={founder.name}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <Avatar 
                      size="md"
                      fallback={founder.name?.charAt(0)?.toUpperCase() || '?'}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{founder.name}</h4>
                      <p className="text-sm text-gray-600">
                        {founder.startups.length} startup{founder.startups.length !== 1 ? 's' : ''} • 
                        ${(founder.totalFunding / 1000).toFixed(0)}K total funding
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {founder.startups.slice(0, 2).map(startup => (
                          <Badge key={startup.id} variant="default" size="sm">
                            {startup.industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {founder.totalEngagement} interactions
                      </div>
                      <Link 
                        to={`/profile/${founder.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Investment Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-600" />
                Investment Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/analytics" className="block w-full btn-primary text-center">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Market Analytics
              </Link>
              <Link to="/leaderboards" className="block w-full btn-outline text-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                Performance Rankings
              </Link>
              <Link to="/connections" className="block w-full btn-outline text-center">
                <UserGroupIcon className="h-4 w-4 mr-2" />
                Network with Founders
              </Link>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
                Risk Patterns
              </CardTitle>
              <CardDescription>Most common failure reasons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketInsights.riskFactors.map((risk, index) => (
                  <div key={risk.risk} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-orange-500' :
                        index === 2 ? 'bg-yellow-500' :
                        index === 3 ? 'bg-blue-500' : 'bg-gray-500'
                      )} />
                      <span className="text-sm text-gray-700 line-clamp-1">{risk.risk}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{risk.percentage}%</div>
                      <div className="text-xs text-gray-500">{risk.count} cases</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Industry Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Breakdown</CardTitle>
              <CardDescription>Failure rates by sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const industries = {}
                  startups.forEach(s => {
                    const industry = s.industry || 'Unknown'
                    industries[industry] = (industries[industry] || 0) + 1
                  })
                  
                  return Object.entries(industries)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([industry, count]) => (
                      <div key={industry} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{industry}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(count / startups.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{count}</span>
                        </div>
                      </div>
                    ))
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Recent Market Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-gray-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {startups.slice(0, 4).map((startup, index) => (
                  <div key={startup.id} className="flex items-start space-x-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      index === 0 ? 'bg-red-400' : 
                      index === 1 ? 'bg-orange-400' :
                      index === 2 ? 'bg-yellow-400' : 'bg-blue-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {startup.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {startup.funding_amount_usd > 0 ? 
                          `$${(startup.funding_amount_usd / 1000).toFixed(0)}K funding lost` :
                          'Bootstrap failure'
                        }
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(startup.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

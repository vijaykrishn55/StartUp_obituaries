import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  PlusIcon, 
  ChartBarIcon, 
  UsersIcon, 
  ChatBubbleLeftIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  HeartIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  LightBulbIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import { Progress } from '../ui/Progress'
import { cn } from '../../lib/utils'
import { startupsAPI, usersAPI } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import LoadingSpinner from '../LoadingSpinner'
import StartupAIForm from '../StartupAIForm'
import StartupStoryAnalyzer from '../StartupStoryAnalyzer'
import StartupNameSearch from '../StartupNameSearch'

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

export default function FounderDashboard() {
  const { user, profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [myStartups, setMyStartups] = useState([])
  const [teamMemberships, setTeamMemberships] = useState([])
  const [showAIForm, setShowAIForm] = useState(false)
  const [showNameSearchForm, setShowNameSearchForm] = useState(false)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [selectedStartup, setSelectedStartup] = useState(null)
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalReactions: 0,
    totalComments: 0,
    engagementRate: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load user's startups
      const startupsRes = await startupsAPI.getMyStartups()
      const startups = startupsRes.data.startups || []
      setMyStartups(startups)

      // Calculate analytics
      const totalViews = startups.reduce((sum, s) => sum + (s.view_count || 0), 0)
      const totalReactions = startups.reduce((sum, s) => sum + (s.upvote_count || 0) + (s.downvote_count || 0) + (s.pivot_count || 0), 0)
      const totalComments = startups.reduce((sum, s) => sum + (s.comment_count || 0), 0)
      const engagementRate = totalViews > 0 ? ((totalReactions + totalComments) / totalViews * 100) : 0

      setAnalytics({
        totalViews,
        totalReactions,
        totalComments,
        engagementRate
      })

      // TODO: Load team memberships when API is ready
      setTeamMemberships([])

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
  }

  const getEngagementTrend = (startup) => {
    // Mock trend calculation - in real app, this would compare with previous period
    const totalEngagement = (startup.upvote_count || 0) + (startup.downvote_count || 0) + (startup.comment_count || 0)
    const trend = Math.random() > 0.5 ? 'up' : 'down'
    const percentage = Math.floor(Math.random() * 20) + 1
    return { trend, percentage }
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
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.first_name || user?.displayName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your startups, track performance, and engage with the community
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowAIForm(true)} 
            className="btn-outline flex items-center bg-gradient-to-r from-purple-50 to-blue-50 border-blue-300 text-blue-800"
          >
            <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
            AI Story
          </button>
          <button 
            onClick={() => setShowNameSearchForm(true)} 
            className="btn-outline flex items-center bg-gradient-to-r from-green-50 to-teal-50 border-teal-300 text-teal-800"
          >
            <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-teal-600" />
            Search Startup
          </button>
          <Link to="/create" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Manual Story
          </Link>
        </div>
      </motion.div>
      
      {/* AI Form Modal */}
      {showAIForm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
        >
          <StartupAIForm onClose={() => setShowAIForm(false)} />
        </motion.div>
      )}
      
      {/* Name Search Modal */}
      {showNameSearchForm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
        >
          <StartupNameSearch onClose={() => setShowNameSearchForm(false)} />
        </motion.div>
      )}
      
      {/* Story Analyzer Modal */}
      {showAnalyzer && selectedStartup && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
        >
          <StartupStoryAnalyzer 
            startup={selectedStartup} 
            onClose={() => {
              setShowAnalyzer(false);
              setSelectedStartup(null);
            }} 
          />
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Views</p>
                <p className="text-2xl font-bold text-blue-900">{analytics.totalViews.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <EyeIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Reactions</p>
                <p className="text-2xl font-bold text-green-900">{analytics.totalReactions}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <HeartIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Comments</p>
                <p className="text-2xl font-bold text-purple-900">{analytics.totalComments}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <ChatBubbleLeftIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-orange-900">{analytics.engagementRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Startups */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-600" />
                    My Startup Stories
                  </CardTitle>
                  <CardDescription>
                    Track performance and manage your shared experiences
                  </CardDescription>
                </div>
                <Badge variant="primary">{myStartups.length} Stories</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {myStartups.length === 0 ? (
                <div className="text-center py-12">
                  <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No stories yet</h3>
                  <p className="text-gray-600 mb-4">Share your first startup story to get started</p>
                  <Link to="/create" className="btn-primary">
                    Share Your Story
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myStartups.map((startup) => {
                    const trend = getEngagementTrend(startup)
                    return (
                      <motion.div
                        key={startup.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{startup.name}</h4>
                              <Badge variant={startup.primary_failure_reason === 'Ran out of funding' ? 'danger' : 'warning'}>
                                {startup.primary_failure_reason}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {startup.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <EyeIcon className="h-4 w-4 mr-1" />
                                {startup.view_count || 0} views
                              </span>
                              <span className="flex items-center">
                                <HeartIcon className="h-4 w-4 mr-1" />
                                {(startup.upvote_count || 0) + (startup.downvote_count || 0)} reactions
                              </span>
                              <span className="flex items-center">
                                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                                {startup.comment_count || 0} comments
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className={cn(
                              "flex items-center text-sm font-medium",
                              trend.trend === 'up' ? 'text-green-600' : 'text-red-600'
                            )}>
                              {trend.trend === 'up' ? (
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowDownIcon className="h-4 w-4 mr-1" />
                              )}
                              {trend.percentage}%
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedStartup(startup);
                                  setShowAnalyzer(true);
                                }}
                                className="text-sm text-amber-600 hover:text-amber-800 flex items-center"
                              >
                                <LightBulbIcon className="h-4 w-4 mr-1" />
                                Analyze
                              </button>
                              <Link 
                                to={`/startup/${startup.id}`}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                View Details →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                onClick={() => setShowAIForm(true)}
                className="block w-full btn-primary bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                AI Generate Story
              </button>
              <button 
                onClick={() => setShowNameSearchForm(true)}
                className="block w-full btn-primary bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-center"
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Search & Create
              </button>
              <Link to="/create" className="block w-full btn-outline text-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Manual Story
              </Link>
              <Link to="/my-startups" className="block w-full btn-outline text-center">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
              <Link to="/connections" className="block w-full btn-outline text-center">
                <UsersIcon className="h-4 w-4 mr-2" />
                Find Team Members
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest interactions with your stories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myStartups.slice(0, 3).map((startup, index) => (
                  <div key={startup.id} className="flex items-start space-x-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      index === 0 ? 'bg-green-400' : 
                      index === 1 ? 'bg-blue-400' : 'bg-purple-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {startup.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {startup.comment_count || 0} new comments
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(startup.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {myStartups.length === 0 && (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Engagement Rate</span>
                  <span className="font-medium">{analytics.engagementRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.engagementRate} max={100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Story Completion</span>
                  <span className="font-medium">
                    {myStartups.filter(s => s.lessons_learned).length}/{myStartups.length}
                  </span>
                </div>
                <Progress 
                  value={myStartups.length > 0 ? (myStartups.filter(s => s.lessons_learned).length / myStartups.length) * 100 : 0} 
                  max={100} 
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

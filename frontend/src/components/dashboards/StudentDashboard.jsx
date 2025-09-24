import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  BookOpenIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ChartBarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ChatBubbleLeftIcon,
  FireIcon,
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

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [startups, setStartups] = useState([])
  const [trendingTopics, setTrendingTopics] = useState([])
  const [learningStats, setLearningStats] = useState({
    storiesRead: 0,
    lessonsLearned: 0,
    industriesExplored: 0,
    connectionsCount: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load all startups for learning
      const startupsRes = await startupsAPI.getStartups()
      const allStartups = startupsRes.data.startups || []
      setStartups(allStartups)

      // Calculate trending topics
      const topicCounts = {}
      allStartups.forEach(startup => {
        const topic = startup.primary_failure_reason || 'Other'
        topicCounts[topic] = (topicCounts[topic] || 0) + 1
      })
      
      const trending = Object.entries(topicCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }))
      
      setTrendingTopics(trending)

      // Mock learning stats (in real app, track user interactions)
      setLearningStats({
        storiesRead: Math.floor(Math.random() * 50) + 10,
        lessonsLearned: allStartups.filter(s => s.lessons_learned).length,
        industriesExplored: new Set(allStartups.map(s => s.industry).filter(Boolean)).size,
        connectionsCount: Math.floor(Math.random() * 20) + 5
      })

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecentStartups = () => {
    return startups
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6)
  }

  const getMostEngagingStartups = () => {
    return startups
      .sort((a, b) => {
        const aEngagement = (a.upvote_count || 0) + (a.comment_count || 0)
        const bEngagement = (b.upvote_count || 0) + (b.comment_count || 0)
        return bEngagement - aEngagement
      })
      .slice(0, 4)
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
            Learn from Failure 📚
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover valuable lessons from startup failures, connect with entrepreneurs, 
            and build your knowledge for future success
          </p>
        </div>
      </motion.div>

      {/* Learning Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Stories Read</p>
                <p className="text-2xl font-bold text-indigo-900">{learningStats.storiesRead}</p>
              </div>
              <div className="p-3 bg-indigo-200 rounded-full">
                <BookOpenIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Lessons Available</p>
                <p className="text-2xl font-bold text-yellow-900">{learningStats.lessonsLearned}</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full">
                <LightBulbIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Industries</p>
                <p className="text-2xl font-bold text-green-900">{learningStats.industriesExplored}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Network</p>
                <p className="text-2xl font-bold text-purple-900">{learningStats.connectionsCount}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Recent Stories */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Latest Failure Stories
                  </CardTitle>
                  <CardDescription>
                    Fresh insights from recent startup experiences
                  </CardDescription>
                </div>
                <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
                  View All →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getRecentStartups().map((startup) => (
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
                        <Badge variant="warning" size="sm">
                          {startup.industry}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {startup.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <ChatBubbleLeftIcon className="h-3 w-3 mr-1" />
                          {startup.comment_count || 0}
                        </span>
                        <span>{new Date(startup.created_at).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Most Engaging Stories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FireIcon className="h-5 w-5 mr-2 text-orange-500" />
                Most Discussed Stories
              </CardTitle>
              <CardDescription>
                Stories generating the most valuable discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getMostEngagingStartups().map((startup, index) => (
                  <motion.div
                    key={startup.id}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white",
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/startup/${startup.id}`}>
                        <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                          {startup.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {startup.primary_failure_reason}
                        </p>
                      </Link>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span className="flex items-center">
                        <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                        {startup.comment_count || 0}
                      </span>
                      <Badge variant="primary" size="sm">
                        {(startup.upvote_count || 0) + (startup.comment_count || 0)} interactions
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Learning Path */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-600" />
                Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/leaderboards" className="block w-full btn-primary text-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                View Leaderboards
              </Link>
              <Link to="/connections" className="block w-full btn-outline text-center">
                <UsersIcon className="h-4 w-4 mr-2" />
                Connect with Founders
              </Link>
              <Link to="/dashboard?filter=trending" className="block w-full btn-outline text-center">
                <FireIcon className="h-4 w-4 mr-2" />
                Trending Stories
              </Link>
            </CardContent>
          </Card>

          {/* Trending Failure Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Common Failure Patterns</CardTitle>
              <CardDescription>Learn from the most frequent causes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingTopics.map((item, index) => (
                  <div key={item.topic} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        index === 0 ? 'bg-red-400' :
                        index === 1 ? 'bg-orange-400' :
                        index === 2 ? 'bg-yellow-400' :
                        index === 3 ? 'bg-blue-400' : 'bg-gray-400'
                      )} />
                      <span className="text-sm text-gray-700">{item.topic}</span>
                    </div>
                    <Badge variant="default" size="sm">
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>


          {/* Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Your Learning Journey</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Stories Completed</span>
                  <span className="font-medium">{learningStats.storiesRead}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((learningStats.storiesRead / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Industries Explored</span>
                  <span className="font-medium">{learningStats.industriesExplored}/20</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((learningStats.industriesExplored / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

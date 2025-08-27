import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
  UsersIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { startupsAPI, usersAPI, commentsAPI } from '../lib/api'
import StartupCard from '../components/StartupCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const filters = [
  { id: 'all', name: 'All Stories', count: 0 },
  { id: 'recent', name: 'Recent', count: 0 },
  { id: 'trending', name: 'Trending', count: 0 },
  { id: 'most-funded', name: 'Most Funded', count: 0 },
]

export default function DashboardPage() {
  const [startups, setStartups] = useState([])
  const [featuredStartups, setFeaturedStartups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    totalStories: 0,
    thisWeek: 0,
    topContributors: 0,
    lessonsLearned: 0,
    loading: true
  });

  const quickStats = [
    { 
      name: 'Total Stories', 
      value: stats.loading ? '...' : stats.totalStories.toLocaleString(), 
      icon: ChatBubbleLeftIcon, 
      color: 'text-blue-600' 
    },
    { 
      name: 'This Week', 
      value: stats.loading ? '...' : stats.thisWeek.toString(), 
      icon: PlusIcon, 
      color: 'text-green-600' 
    },
    { 
      name: 'Top Contributors', 
      value: stats.loading ? '...' : stats.topContributors.toString(), 
      icon: UsersIcon, 
      color: 'text-purple-600' 
    },
    { 
      name: 'Lessons Learned', 
      value: stats.loading ? '...' : stats.lessonsLearned.toLocaleString(), 
      icon: TrophyIcon, 
      color: 'text-orange-600' 
    },
  ];

  useEffect(() => {
    loadStartups();
    loadFeaturedStartups();
  }, [])

  useEffect(() => {
    if (startups.length > 0) {
      loadStats();
    }
  }, [startups])

  const loadStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      // Get users first to count unique contributors
      const usersRes = await usersAPI.getUsers();
      const uniqueContributors = new Set(usersRes.data.map(u => u.id)).size;
      
      // Get comments count for all startups
      const commentsRes = await Promise.all(
        startups.map(s => 
          commentsAPI.getComments(s.id)
            .then(res => res.data.length)
            .catch(() => 0)
        )
      );
      
      const totalLessons = commentsRes.reduce((sum, count) => sum + count, 0);
      
      // Get this week's count from the already loaded startups
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekCount = startups.filter(startup => 
        new Date(startup.created_at) > oneWeekAgo
      ).length;
      
      setStats({
        totalStories: startups.length,
        thisWeek: thisWeekCount,
        topContributors: uniqueContributors,
        lessonsLearned: totalLessons,
        loading: false
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const loadStartups = async () => {
    try {
      setError(null)
      const response = await startupsAPI.getStartups()
      const startupsData = response.data.startups || response.data || [];
      setStartups(startupsData);
      
      // Update filters count
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekCount = startupsData.filter(startup => 
        new Date(startup.created_at) > oneWeekAgo
      ).length;
      
      filters[0].count = startupsData.length;
      filters[1].count = thisWeekCount;
    } catch (error) {
      console.error('Failed to load startups:', error)
      setError('Failed to load startups. Please check your connection and try again.')
      setStartups([]);
    } finally {
      setLoading(false)
    }
  }

  const loadFeaturedStartups = async () => {
    try {
      const response = await startupsAPI.getFeatured()
      setFeaturedStartups(response.data.startups || response.data || [])
    } catch (error) {
      console.error('Failed to load featured startups:', error)
      setFeaturedStartups([]);
    }
  }

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         startup.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         startup.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         startup.primary_failure_reason?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeFilter === 'all') return matchesSearch
    if (activeFilter === 'recent') {
      const isRecent = new Date(startup.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return matchesSearch && isRecent
    }
    if (activeFilter === 'trending') {
      return matchesSearch && (startup.reaction_count > 0 || startup.comment_count > 0)
    }
    if (activeFilter === 'most-funded') {
      return matchesSearch && startup.total_funding_amount > 0
    }
    return matchesSearch
  })

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-7xl mx-auto">
      {error && (
        <ErrorMessage 
          error={error} 
          onDismiss={() => setError(null)}
          className="mb-6"
        />
      )}
      {/* Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Startup Obituaries Feed</h1>
            <p className="mt-2 text-gray-600">Discover stories of failure and learn from the experiences of fellow entrepreneurs</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/create" className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Share Your Story
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="card-hover"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-gray-50`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search startup stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <button className="btn-outline flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="mt-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeFilter === filter.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {filter.name}
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {filter.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Featured Stories */}
          {featuredStartups.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredStartups.slice(0, 2).map((startup) => (
                  <StartupCard key={startup.id} startup={startup} featured />
                ))}
              </div>
            </div>
          )}

          {/* Startup Stories */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {activeFilter === 'all' ? 'All Stories' : filters.find(f => f.id === activeFilter)?.name}
            </h2>
            
            {filteredStartups.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💀</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search terms' : 'Be the first to share your startup story'}
                </p>
                <Link to="/create" className="btn-primary">
                  Share Your Story
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredStartups.map((startup) => (
                  <StartupCard key={startup.id} startup={startup} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trending Topics</h3>
            <div className="space-y-2">
              {startups.length > 0 ? (
                startups.slice(0, 5).map((startup, index) => (
                  <div key={startup.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{startup.primary_failure_reason || startup.industry || 'General Failure'}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {startup.reaction_count || 0}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No trending topics yet</div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/create" className="block w-full btn-primary text-center">
                Share Your Story
              </Link>
              <Link to="/leaderboards" className="block w-full btn-outline text-center">
                View Leaderboards
              </Link>
              <Link to="/connections" className="block w-full btn-outline text-center">
                Find Connections
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              {startups.slice(0, 3).map((startup, index) => (
                <div key={startup.id} className="flex items-start space-x-2">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    index === 0 ? 'bg-green-400' : 
                    index === 1 ? 'bg-blue-400' : 'bg-purple-400'
                  }`}></div>
                  <div>
                    <p className="text-gray-600">
                      <span className="font-medium">{startup.creator_username}</span> shared {startup.name}
                    </p>
                    <p className="text-gray-400">
                      {new Date(startup.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {startups.length === 0 && (
                <div className="text-sm text-gray-500">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

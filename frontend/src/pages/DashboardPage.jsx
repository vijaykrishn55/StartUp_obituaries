import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { cn } from '../lib/utils'
import { industries } from '../lib/constants'
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
  const [showFilters, setShowFilters] = useState(false)
  const [industryFilters, setIndustryFilters] = useState([])
  const filterDropdownRef = useRef(null)
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

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilters(false)
      }
    }

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showFilters])

  const loadStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      // Get users first to count unique contributors
      const usersRes = await usersAPI.getUsers();
      const usersData = usersRes.data.users || usersRes.data || [];
      const uniqueContributors = new Set(usersData.map(u => u.id)).size;
      
      // Count startups that have lessons_learned content
      const totalLessons = startups.filter(startup => 
        startup.lessons_learned && startup.lessons_learned.trim().length > 0
      ).length;
      
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
      
      const trendingCount = startupsData.filter(startup => {
        const totalEngagement = (startup.upvote_count || 0) + (startup.downvote_count || 0) + (startup.comment_count || 0)
        return totalEngagement > 0
      }).length;
      
      const fundedCount = startupsData.filter(startup => 
        startup.funding_amount_usd > 0
      ).length;
      
      filters[0].count = startupsData.length;
      filters[1].count = thisWeekCount;
      filters[2].count = trendingCount;
      filters[3].count = fundedCount;
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

  const getFilteredStartups = () => {
    let filtered = [...startups]
    
    // Apply filter logic
    if (activeFilter === 'recent') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(startup => new Date(startup.created_at) > oneWeekAgo)
    } else if (activeFilter === 'trending') {
      // Sort by engagement (reactions + comments) in last 7 days with recency weight
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      filtered = filtered
        .filter(startup => {
          const createdAt = new Date(startup.created_at)
          const totalEngagement = (startup.upvote_count || 0) + (startup.downvote_count || 0) + (startup.pivot_count || 0) + (startup.comment_count || 0)
          return totalEngagement > 0 && createdAt > oneWeekAgo
        })
        .sort((a, b) => {
          const aEngagement = (a.upvote_count || 0) + (a.downvote_count || 0) + (a.pivot_count || 0) + (a.comment_count || 0)
          const bEngagement = (b.upvote_count || 0) + (b.downvote_count || 0) + (b.pivot_count || 0) + (b.comment_count || 0)
          
          // Add recency boost (newer posts get slight advantage)
          const aRecency = (now - new Date(a.created_at)) / (1000 * 60 * 60 * 24) // days old
          const bRecency = (now - new Date(b.created_at)) / (1000 * 60 * 60 * 24)
          const aScore = aEngagement * (1 + Math.max(0, (7 - aRecency) / 7) * 0.2)
          const bScore = bEngagement * (1 + Math.max(0, (7 - bRecency) / 7) * 0.2)
          
          return bScore - aScore
        })
        .slice(0, 7)
    } else if (activeFilter === 'most-funded') {
      filtered = filtered
        .filter(startup => startup.funding_amount_usd > 0)
        .sort((a, b) => (b.funding_amount_usd || 0) - (a.funding_amount_usd || 0))
        .slice(0, 6)
    }
    
    // Apply industry filter
    if (industryFilters.length > 0) {
      filtered = filtered.filter(startup => 
        industryFilters.includes(startup.industry)
      )
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(startup => {
        const query = searchQuery.toLowerCase()
        return startup.name?.toLowerCase().includes(query) ||
               startup.description?.toLowerCase().includes(query) ||
               startup.industry?.toLowerCase().includes(query) ||
               startup.primary_failure_reason?.toLowerCase().includes(query)
      })
    }
    
    return filtered
  }
  
  const filteredStartups = getFilteredStartups()

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
              <div className="relative" ref={filterDropdownRef}>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors',
                    showFilters && 'bg-gray-50'
                  )}
                >
                  <FunnelIcon className="h-4 w-4" />
                  <span>Filters</span>
                  {industryFilters.length > 0 && (
                    <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs font-medium">
                      {industryFilters.length}
                    </span>
                  )}
                  <ChevronDownIcon className={cn(
                    'h-4 w-4 transition-transform',
                    showFilters && 'rotate-180'
                  )} />
                </button>
                
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Filter by Industry</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(() => {
                          const uniqueIndustries = [...new Set(startups.map(s => s.industry).filter(Boolean))]
                          return uniqueIndustries.map(industry => (
                            <label key={industry} className="flex items-center">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setIndustryFilters([...industryFilters, industry])
                                  } else {
                                    setIndustryFilters(industryFilters.filter(f => f !== industry))
                                  }
                                }}
                                checked={industryFilters.includes(industry)}
                              />
                              <span className="ml-2 text-sm text-gray-700">{industry}</span>
                            </label>
                          ))
                        })()}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <button 
                          onClick={() => {
                            setIndustryFilters([])
                            setShowFilters(false)
                          }}
                          className="w-full btn-outline text-sm"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                      activeFilter === filter.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
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

          {/* Featured Stories - only show when not searching, on 'all' filter, and no industry filters */}
          {featuredStartups.length > 0 && !searchQuery && activeFilter === 'all' && industryFilters.length === 0 && (
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
              {(() => {
                // Get unique failure reasons and their counts
                const topicCounts = {}
                startups.forEach(startup => {
                  const topic = startup.primary_failure_reason || 'Other'
                  if (!topicCounts[topic]) {
                    topicCounts[topic] = 0
                  }
                  topicCounts[topic] += 1
                })
                
                // Sort by count and get top 5
                const sortedTopics = Object.entries(topicCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                
                return sortedTopics.length > 0 ? (
                  sortedTopics.map(([topic, count]) => (
                    <div key={topic} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{topic}</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No trending topics yet</div>
                )
              })()}
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

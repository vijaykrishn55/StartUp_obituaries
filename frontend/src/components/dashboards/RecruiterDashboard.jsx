import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  UserGroupIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  StarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../lib/utils'
import { startupsAPI, usersAPI } from '../../lib/api'
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

export default function RecruiterDashboard() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [startups, setStartups] = useState([])
  const [talentPool, setTalentPool] = useState([])
  const [recruitmentStats, setRecruitmentStats] = useState({
    totalTalent: 0,
    availableTalent: 0,
    topSkills: [],
    industries: []
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load startups to analyze talent
      const startupsRes = await startupsAPI.getStartups()
      const allStartups = startupsRes.data.startups || []
      setStartups(allStartups)

      // Load users for talent pool
      const usersRes = await usersAPI.getUsers()
      const allUsers = usersRes.data.users || usersRes.data || []
      
      // Filter talent (founders and those open to work)
      const availableTalent = allUsers.filter(u => 
        u.open_to_work || u.user_role === 'founder' || u.open_to_co_founding
      )
      setTalentPool(availableTalent)

      // Analyze skills and industries
      const skillCounts = {}
      const industryCounts = {}
      
      allStartups.forEach(startup => {
        if (startup.industry) {
          industryCounts[startup.industry] = (industryCounts[startup.industry] || 0) + 1
        }
      })

      availableTalent.forEach(person => {
        if (person.skills && Array.isArray(person.skills)) {
          person.skills.forEach(skill => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1
          })
        }
      })

      const topSkills = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([skill, count]) => ({ skill, count }))

      const topIndustries = Object.entries(industryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6)
        .map(([industry, count]) => ({ industry, count }))

      setRecruitmentStats({
        totalTalent: allUsers.length,
        availableTalent: availableTalent.length,
        topSkills,
        industries: topIndustries
      })

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTopTalent = () => {
    return talentPool
      .sort((a, b) => {
        // Score based on experience, skills, and startup involvement
        const aScore = (a.skills?.length || 0) * 2 + (a.open_to_work ? 5 : 0) + (a.user_role === 'founder' ? 10 : 0)
        const bScore = (b.skills?.length || 0) * 2 + (b.open_to_work ? 5 : 0) + (b.user_role === 'founder' ? 10 : 0)
        return bScore - aScore
      })
      .slice(0, 8)
  }

  const getRecentlyAvailable = () => {
    return startups
      .filter(s => s.died_year >= new Date().getFullYear() - 1) // Recent failures
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6)
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
            Talent Discovery Hub 🎯
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find exceptional talent from startup experiences, connect with founders, 
            and discover candidates with real-world entrepreneurial skills
          </p>
        </div>
      </motion.div>

      {/* Recruitment Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-600">Total Talent Pool</p>
                <p className="text-2xl font-bold text-cyan-900">{recruitmentStats.totalTalent}</p>
              </div>
              <div className="p-3 bg-cyan-200 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Available Now</p>
                <p className="text-2xl font-bold text-green-900">{recruitmentStats.availableTalent}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <BriefcaseIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Skill Categories</p>
                <p className="text-2xl font-bold text-purple-900">{recruitmentStats.topSkills.length}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <AcademicCapIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Industries</p>
                <p className="text-2xl font-bold text-orange-900">{recruitmentStats.industries.length}</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <BuildingOfficeIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Top Talent */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <StarIcon className="h-5 w-5 mr-2 text-yellow-500" />
                    Featured Talent
                  </CardTitle>
                  <CardDescription>
                    High-potential candidates with startup experience
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getTopTalent().map((person) => (
                  <motion.div
                    key={person.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar 
                        size="md"
                        fallback={`${person.first_name?.[0] || ''}${person.last_name?.[0] || ''}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {person.first_name} {person.last_name}
                          </h4>
                          {person.open_to_work && (
                            <Badge variant="success" size="sm">Available</Badge>
                          )}
                          {person.user_role === 'founder' && (
                            <Badge variant="purple" size="sm">Founder</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">@{person.username}</p>
                        {person.bio && (
                          <p className="text-xs text-gray-700 mb-2 line-clamp-2">{person.bio}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {person.skills?.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="default" size="sm">
                              {skill}
                            </Badge>
                          ))}
                          {person.skills?.length > 3 && (
                            <Badge variant="default" size="sm">
                              +{person.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2 text-gray-500">
                            {person.linkedin_url && (
                              <span>LinkedIn</span>
                            )}
                            {person.github_url && (
                              <span>GitHub</span>
                            )}
                          </div>
                          <Link 
                            to={`/profile/${person.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Profile →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recently Available Talent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                Recently Available Talent
              </CardTitle>
              <CardDescription>
                Founders and team members from recent startup closures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getRecentlyAvailable().map((startup, index) => (
                  <motion.div
                    key={startup.id}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex-shrink-0">
                      <Avatar 
                        size="md"
                        fallback={startup.creator_username?.[0]?.toUpperCase() || '?'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{startup.name}</h4>
                        <Badge variant="warning" size="sm">{startup.industry}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Founded by <strong>{startup.creator_username}</strong>
                      </p>
                      <p className="text-xs text-gray-500">
                        {startup.stage_at_death} stage • 
                        {startup.funding_amount_usd > 0 && ` $${(startup.funding_amount_usd / 1000).toFixed(0)}K funding • `}
                        Closed {startup.died_year}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant="danger" size="sm">
                        {startup.primary_failure_reason}
                      </Badge>
                      <Link 
                        to={`/startup/${startup.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View Story →
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
          {/* Recruitment Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BriefcaseIcon className="h-5 w-5 mr-2 text-blue-600" />
                Recruitment Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/connections" className="block w-full btn-primary text-center">
                <UserGroupIcon className="h-4 w-4 mr-2" />
                Browse Talent
              </Link>
              <Link to="/messages" className="block w-full btn-outline text-center">
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Advanced Search
              </Link>
              <Link to="/leaderboards" className="block w-full btn-outline text-center">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Talent Rankings
              </Link>
            </CardContent>
          </Card>

          {/* Top Skills in Demand */}
          <Card>
            <CardHeader>
              <CardTitle>In-Demand Skills</CardTitle>
              <CardDescription>Most common skills in talent pool</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recruitmentStats.topSkills.map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                      )} />
                      <span className="text-sm text-gray-700">{skill.skill}</span>
                    </div>
                    <Badge variant="default" size="sm">
                      {skill.count} people
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Industry Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Experience</CardTitle>
              <CardDescription>Talent by industry background</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recruitmentStats.industries.map((industry, index) => (
                  <div key={industry.industry} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{industry.industry}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${Math.min((industry.count / Math.max(...recruitmentStats.industries.map(i => i.count))) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{industry.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hiring Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Opportunities</CardTitle>
              <CardDescription>Ready-to-hire candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900 text-sm">Senior Developer</h4>
                    <Badge variant="success" size="sm">Available</Badge>
                  </div>
                  <p className="text-xs text-green-700 mb-1">Ex-FinTech founder, 8+ years</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600">React, Node.js, AWS</span>
                    <span className="text-green-500">$120k-150k</span>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900 text-sm">Product Manager</h4>
                    <Badge variant="primary" size="sm">Open</Badge>
                  </div>
                  <p className="text-xs text-blue-700 mb-1">Ex-SaaS startup, PMF expert</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600">B2B, Analytics, Growth</span>
                    <span className="text-blue-500">$100k-130k</span>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-900 text-sm">Marketing Lead</h4>
                    <Badge variant="purple" size="sm">Interested</Badge>
                  </div>
                  <p className="text-xs text-purple-700 mb-1">Growth hacker, 5+ years</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-600">SEO, PPC, Content</span>
                    <span className="text-purple-500">$80k-110k</span>
                  </div>
                </div>
              </div>
              <Link to="/connections" className="block w-full btn-outline text-center mt-4">
                View All Candidates
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

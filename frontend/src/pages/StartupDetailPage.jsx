import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShareIcon,
  BookmarkIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid'
import { startupsAPI, reactionsAPI, commentsAPI, teamAPI } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import ReactionPanel from '../components/ReactionPanel'
import CommentsSection from '../components/CommentsSection'
import TeamSection from '../components/TeamSection'
import LogoUpload from '../components/LogoUpload'
import { cn, getFailureReasonStyle, formatCurrency, formatDate } from '../lib/utils'

export default function StartupDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [startup, setStartup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reactions, setReactions] = useState({ upvotes: 0, downvotes: 0, pivot: 0 })
  const [userReaction, setUserReaction] = useState(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)

  useEffect(() => {
    loadStartup()
    loadReactions()
  }, [id])

  const loadStartup = async () => {
    try {
      const response = await startupsAPI.getStartup(id)
      setStartup(response.data)
      setLogoUrl(response.data.logo_url)
    } catch (error) {
      console.error('Failed to load startup:', error)
      if (error.response?.status === 404) {
        navigate('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadReactions = async () => {
    try {
      const response = await reactionsAPI.getReactions(id)
      setReactions(response.data)
    } catch (error) {
      console.error('Failed to load reactions:', error)
    }
  }

  const handleReaction = async (type) => {
    try {
      if (userReaction === type) {
        await reactionsAPI.removeReaction(id, type)
        setUserReaction(null)
        setReactions(prev => ({
          ...prev,
          [type === 'upvote' ? 'upvotes' : type === 'downvote' ? 'downvotes' : 'pivot']: prev[type === 'upvote' ? 'upvotes' : type === 'downvote' ? 'downvotes' : 'pivot'] - 1
        }))
      } else {
        const response = await reactionsAPI.addReaction(id, type)
        setUserReaction(type)
        setReactions(response.data)
      }
    } catch (error) {
      console.error('Failed to update reaction:', error)
    }
  }

  const handleLogoUpdate = (newLogoUrl) => {
    setLogoUrl(newLogoUrl)
    setStartup(prev => ({ ...prev, logo_url: newLogoUrl }))
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'Undisclosed'
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getYearsActive = () => {
    if (!startup.founded_year || !startup.died_year) return null
    return startup.died_year - startup.founded_year
  }

  const isOwner = user && startup && user.id === startup.created_by_user_id

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading startup story..." />
  }

  if (!startup) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">💀</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Startup not found</h3>
        <p className="text-gray-600 mb-4">The startup story you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary">
          Back to Feed
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-outline flex items-center"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
      </div>

      {/* Header */}
      <div className="card mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4 flex-1">
            {logoUrl ? (
              <img
                src={`http://localhost:3000${logoUrl}`}
                alt={`${startup.name} logo`}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">
                  {startup.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{startup.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                {startup.industry}
              </div>
              
              {startup.founded_year && startup.died_year && (
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {startup.founded_year} - {startup.died_year} ({getYearsActive()} years)
                </div>
              )}
              
              {startup.stage_at_death && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  {startup.stage_at_death}
                </span>
              )}
              </div>

              {startup.vision && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Vision</h3>
                  <p className="text-gray-600 italic">"{startup.vision}"</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-6">
            {isOwner && (
              <>
                <Link
                  to={`/startup/${startup.id}/edit`}
                  className="btn-outline flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Link>
                <button className="btn text-red-600 border-red-300 hover:bg-red-50">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </>
            )}
            
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={cn(
                'btn-outline flex items-center',
                isBookmarked && 'text-yellow-600 border-yellow-300 bg-yellow-50'
              )}
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="h-4 w-4" />
              ) : (
                <BookmarkIcon className="h-4 w-4" />
              )}
            </button>
            
            <button className="btn-outline flex items-center">
              <ShareIcon className="h-4 w-4 mr-1" />
              Share
            </button>
          </div>
        </div>

        {/* Logo Upload for Owner */}
        {user && startup.user_id === user.id && (
          <div className="mb-6">
            <LogoUpload
              startupId={startup.id}
              currentLogo={logoUrl}
              onLogoUpdate={handleLogoUpdate}
            />
          </div>
        )}

        {/* Failure reason highlight */}
        <div className={cn(
          'border rounded-lg p-4 mb-6',
          getFailureReasonStyle(startup.primary_failure_reason)
        )}>
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">Primary Failure Reason: {startup.primary_failure_reason}</span>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {startup.funding_amount_usd && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-600 mr-1" />
                <span className="text-sm font-medium text-gray-600">Total Funding</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(startup.funding_amount_usd)}
              </div>
            </div>
          )}
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <UserGroupIcon className="h-5 w-5 text-gray-600 mr-1" />
              <span className="text-sm font-medium text-gray-600">Team Size</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {startup.team_members?.length || 1}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CalendarIcon className="h-5 w-5 text-gray-600 mr-1" />
              <span className="text-sm font-medium text-gray-600">Duration</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {getYearsActive() || 'N/A'} {getYearsActive() === 1 ? 'year' : 'years'}
            </div>
          </div>
        </div>

        {/* Description */}
        {startup.description && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
            <p className="text-gray-600 leading-relaxed">{startup.description}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Autopsy Report */}
          {startup.autopsy_report && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💀 Autopsy Report</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {startup.autopsy_report}
                </p>
              </div>
            </div>
          )}

          {/* Peak Metrics */}
          {startup.peak_metrics && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Peak Metrics</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(() => {
                    try {
                      const metrics = typeof startup.peak_metrics === 'string' 
                        ? JSON.parse(startup.peak_metrics) 
                        : startup.peak_metrics;
                      
                      return Object.entries(metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-2xl font-bold text-green-700">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {key.replace(/_/g, ' ')}
                          </div>
                        </div>
                      ));
                    } catch (e) {
                      return (
                        <p className="text-gray-600 leading-relaxed col-span-3">
                          {startup.peak_metrics}
                        </p>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          )}


          {/* Advice for Founders */}
          {startup.advice_for_founders && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Advice for Founders</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {startup.advice_for_founders}
                </p>
              </div>
            </div>
          )}

          {/* Team Section */}
          <TeamSection startupId={startup.id} isOwner={isOwner} />

          {/* Comments */}
          <CommentsSection startupId={startup.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reactions */}
          <ReactionPanel
            reactions={reactions}
            onReaction={handleReaction}
            userReaction={userReaction}
          />

          {/* Key Info */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Key Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Industry</span>
                <span className="font-medium">{startup.industry}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Stage at Death</span>
                <span className="font-medium">{startup.stage_at_death}</span>
              </div>
              
              {startup.funding_amount_usd && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Funding</span>
                  <span className="font-medium">{formatCurrency(startup.funding_amount_usd)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Posted</span>
                <span className="font-medium">{formatDate(startup.created_at)}</span>
              </div>
              
              {startup.is_anonymous ? (
                <div className="flex justify-between">
                  <span className="text-gray-600">Author</span>
                  <span className="font-medium text-gray-500">Anonymous</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-600">Author</span>
                  <Link 
                    to={`/profile/${startup.created_by_user_id}`}
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    {startup.creator_username}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Investors */}
          {startup.key_investors && startup.key_investors.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Key Investors</h3>
              <div className="space-y-2">
                {startup.key_investors.map((investor, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {investor}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {startup.links && startup.links.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Related Links</h3>
              <div className="space-y-2">
                {startup.links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary-600 hover:text-primary-700 truncate"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

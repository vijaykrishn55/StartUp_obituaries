import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowUturnLeftIcon,
  HeartIcon,
  FlagIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Avatar } from './ui/Avatar'
import { Badge } from './ui/Badge'
import { cn } from '../lib/utils'
import { commentsAPI } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { formatDistanceToNow } from 'date-fns'

const CommentItem = ({ comment, level = 0, onReply, onLike, onReport }) => {
  const { user } = useAuthStore()
  const [isExpanded, setIsExpanded] = useState(true)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onReply(comment.id, replyContent.trim())
      setReplyContent('')
      setShowReplyForm(false)
    } catch (error) {
      console.error('Failed to reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFounderOrTeamMember = user?.user_role === 'founder' || comment.is_team_member

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border-l-2 transition-colors",
        level === 0 ? "border-transparent" : "border-gray-200 ml-6 pl-4",
        level > 3 && "ml-2 pl-2" // Limit deep nesting
      )}
    >
      <div className="flex space-x-3 py-4">
        <Avatar 
          size="sm"
          fallback={comment.user_name?.charAt(0)?.toUpperCase() || '?'}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900 text-sm">
              {comment.user_name}
            </span>
            {isFounderOrTeamMember && (
              <Badge variant="purple" size="sm">
                {comment.is_founder ? 'Founder' : 'Team Member'}
              </Badge>
            )}
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <div className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
            {comment.content}
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <button
              onClick={() => onLike(comment.id)}
              className={cn(
                "flex items-center space-x-1 hover:text-red-600 transition-colors",
                comment.user_liked ? "text-red-600" : "text-gray-500"
              )}
            >
              {comment.user_liked ? (
                <HeartSolidIcon className="h-4 w-4" />
              ) : (
                <HeartIcon className="h-4 w-4" />
              )}
              <span>{comment.like_count || 0}</span>
            </button>

            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
              <span>Reply</span>
            </button>

            {comment.replies?.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
                <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
              </button>
            )}

            <button
              onClick={() => onReport(comment.id)}
              className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <FlagIcon className="h-4 w-4" />
              <span>Report</span>
            </button>
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleReply}
                className="mt-3 space-y-2"
              >
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim() || isSubmitting}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Posting...' : 'Reply'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Nested Replies */}
          <AnimatePresence>
            {isExpanded && comment.replies?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2"
              >
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    level={level + 1}
                    onReply={onReply}
                    onLike={onLike}
                    onReport={onReport}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default function ThreadedComments({ startupId, className }) {
  const { user } = useAuthStore()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, popular

  useEffect(() => {
    loadComments()
  }, [startupId, sortBy])

  const loadComments = async () => {
    try {
      setLoading(true)
      const response = await commentsAPI.getComments(startupId, { sort: sortBy })
      const commentsData = response.data.comments || []
      
      // Build threaded structure
      const commentMap = {}
      const rootComments = []

      // First pass: create comment map
      commentsData.forEach(comment => {
        commentMap[comment.id] = { ...comment, replies: [] }
      })

      // Second pass: build tree structure
      commentsData.forEach(comment => {
        if (comment.parent_comment_id && commentMap[comment.parent_comment_id]) {
          commentMap[comment.parent_comment_id].replies.push(commentMap[comment.id])
        } else {
          rootComments.push(commentMap[comment.id])
        }
      })

      setComments(rootComments)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await commentsAPI.createComment(startupId, {
        content: newComment.trim(),
        parent_comment_id: null
      })
      setNewComment('')
      await loadComments() // Reload to get updated comments
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (parentId, content) => {
    await commentsAPI.createComment(startupId, {
      content,
      parent_comment_id: parentId
    })
    await loadComments()
  }

  const handleLike = async (commentId) => {
    try {
      await commentsAPI.toggleLike(commentId)
      await loadComments()
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleReport = async (commentId) => {
    try {
      // TODO: Implement report functionality
      console.log('Report comment:', commentId)
    } catch (error) {
      console.error('Failed to report comment:', error)
    }
  }

  if (!user) {
    return (
      <div className={cn("text-center py-8", className)}>
        <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Please log in to view and post comments</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
          Discussion ({comments.length})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="flex space-x-3">
          <Avatar 
            size="sm"
            fallback={`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this startup story..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h4>
          <p className="text-gray-600">Be the first to share your thoughts on this startup story!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onLike={handleLike}
              onReport={handleReport}
            />
          ))}
        </div>
      )}
    </div>
  )
}

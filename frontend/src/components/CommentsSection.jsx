import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftIcon,
  PlusIcon,
  ArrowUturnLeftIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { commentsAPI } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { clsx } from 'clsx'

export default function CommentsSection({ startupId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [editingComment, setEditingComment] = useState(null)
  const [editContent, setEditContent] = useState('')
  const { user } = useAuthStore()

  useEffect(() => {
    loadComments()
  }, [startupId])

  const loadComments = async () => {
    try {
      const response = await commentsAPI.getComments(startupId)
      setComments(response.data.comments || [])
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const response = await commentsAPI.createComment(
        startupId, 
        newComment, 
        replyTo?.id || null
      )
      
      setComments(prev => [...prev, response.data.comment])
      setNewComment('')
      setReplyTo(null)
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return

    try {
      await commentsAPI.updateComment(commentId, editContent)
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: editContent }
          : comment
      ))
      setEditingComment(null)
      setEditContent('')
    } catch (error) {
      console.error('Failed to update comment:', error)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await commentsAPI.deleteComment(commentId)
      setComments(prev => prev.filter(comment => comment.id !== commentId))
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const organizeComments = (comments) => {
    const commentMap = {}
    const rootComments = []

    // First pass: create comment map
    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] }
    })

    // Second pass: organize into tree structure
    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentMap[comment.parent_comment_id]
        if (parent) {
          parent.replies.push(commentMap[comment.id])
        }
      } else {
        rootComments.push(commentMap[comment.id])
      }
    })

    return rootComments
  }

  const renderComment = (comment, depth = 0) => {
    const isEditing = editingComment === comment.id
    const canEdit = user && user.id === comment.user_id

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx(
          'border-l-2 border-gray-200 pl-4',
          depth > 0 && 'ml-6 mt-4'
        )}
      >
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="h-6 w-6 text-gray-400" />
              <div>
                <span className="font-medium text-gray-900">
                  {comment.user_name || 'Anonymous'}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatDate(comment.created_at)}
                </span>
              </div>
            </div>

            {canEdit && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setEditingComment(comment.id)
                    setEditContent(comment.content)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="input w-full"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  className="btn-primary text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null)
                    setEditContent('')
                  }}
                  className="btn-outline text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-3 whitespace-pre-line">
                {comment.content}
              </p>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setReplyTo(comment)}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowUturnLeftIcon className="h-4 w-4" />
                  <span>Reply</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </motion.div>
    )
  }

  const organizedComments = organizeComments(comments)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <ChatBubbleLeftIcon className="h-6 w-6 mr-2" />
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          {replyTo && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <span className="text-blue-700">
                Replying to {replyTo.user_name}: "{replyTo.content.substring(0, 50)}..."
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                Cancel
              </button>
            </div>
          )}
          
          <div className="flex space-x-3">
            <UserCircleIcon className="h-8 w-8 text-gray-400 mt-1" />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "Write a reply..." : "Share your thoughts..."}
                className="input w-full"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="btn-primary flex items-center disabled:opacity-50"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  {replyTo ? 'Reply' : 'Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading comments...</p>
        </div>
      ) : organizedComments.length === 0 ? (
        <div className="text-center py-8">
          <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
          <p className="text-gray-600">
            {user ? 'Be the first to share your thoughts!' : 'Sign in to join the conversation.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {organizedComments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  )
}

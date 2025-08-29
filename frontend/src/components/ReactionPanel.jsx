import { motion } from 'framer-motion'
import { 
  HandThumbUpIcon,
  HandThumbDownIcon,
  LightBulbIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { 
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  ArrowPathIcon as ArrowPathSolidIcon
} from '@heroicons/react/24/solid'
import { cn } from '../lib/utils'
import { reactionTypes } from '../lib/constants'

export default function ReactionPanel({ reactions, onReaction, userReaction }) {
  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Community Reactions</h3>
      
      <div className="space-y-3">
        {/* Upvote - Brilliant Mistake */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onReaction('upvote')}
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200',
            userReaction === 'upvote'
              ? 'border-green-300 bg-green-50 text-green-700'
              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
          )}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{reactionTypes.upvote.emoji}</span>
            <div className="text-left">
              <div className="font-medium">{reactionTypes.upvote.label}</div>
              <div className="text-xs text-gray-500">{reactionTypes.upvote.description}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {userReaction === 'upvote' ? (
              <HandThumbUpSolidIcon className="h-5 w-5" />
            ) : (
              <HandThumbUpIcon className="h-5 w-5" />
            )}
            {reactions.upvotes > 0 && <span className="font-bold">{reactions.upvotes}</span>}
          </div>
        </motion.button>

        {/* Pivot - Deserved Pivot */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onReaction('pivot')}
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200',
            userReaction === 'pivot'
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          )}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{reactionTypes.pivot.emoji}</span>
            <div className="text-left">
              <div className="font-medium">{reactionTypes.pivot.label}</div>
              <div className="text-xs text-gray-500">{reactionTypes.pivot.description}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {userReaction === 'pivot' ? (
              <ArrowPathSolidIcon className="h-5 w-5" />
            ) : (
              <ArrowPathIcon className="h-5 w-5" />
            )}
            {reactions.pivot > 0 && <span className="font-bold">{reactions.pivot}</span>}
          </div>
        </motion.button>

        {/* Downvote - RIP */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onReaction('downvote')}
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200',
            userReaction === 'downvote'
              ? 'border-red-300 bg-red-50 text-red-700'
              : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
          )}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{reactionTypes.downvote.emoji}</span>
            <div className="text-left">
              <div className="font-medium">{reactionTypes.downvote.label}</div>
              <div className="text-xs text-gray-500">{reactionTypes.downvote.description}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {userReaction === 'downvote' ? (
              <HandThumbDownSolidIcon className="h-5 w-5" />
            ) : (
              <HandThumbDownIcon className="h-5 w-5" />
            )}
            {reactions.downvotes > 0 && <span className="font-bold">{reactions.downvotes}</span>}
          </div>
        </motion.button>

      </div>

      {/* Total reactions */}
      {((reactions.upvotes || 0) + (reactions.downvotes || 0) + (reactions.pivot || 0)) > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 text-center">
            {(reactions.upvotes || 0) + (reactions.downvotes || 0) + (reactions.pivot || 0)} total reactions
          </div>
        </div>
      )}
    </div>
  )
}

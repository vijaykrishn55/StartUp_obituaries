import { motion } from 'framer-motion'
import { 
  HandThumbUpIcon,
  HandThumbDownIcon,
  LightBulbIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { 
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon
} from '@heroicons/react/24/solid'
import { clsx } from 'clsx'

const reactionTypes = {
  upvote: { emoji: '💡', label: 'Brilliant Mistake', description: 'This failure taught valuable lessons' },
  downvote: { emoji: '🪦', label: 'RIP', description: 'Rest in peace, startup' }
}

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
          className={clsx(
            'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200',
            userReaction === 'upvote'
              ? 'border-green-300 bg-green-50 text-green-700'
              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
          )}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">💡</span>
            <div className="text-left">
              <div className="font-medium">Brilliant Mistake</div>
              <div className="text-xs text-gray-500">This failure taught valuable lessons</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {userReaction === 'upvote' ? (
              <HandThumbUpSolidIcon className="h-5 w-5" />
            ) : (
              <HandThumbUpIcon className="h-5 w-5" />
            )}
            <span className="font-bold">{reactions.upvotes || 0}</span>
          </div>
        </motion.button>

        {/* Downvote - RIP */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onReaction('downvote')}
          className={clsx(
            'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200',
            userReaction === 'downvote'
              ? 'border-gray-400 bg-gray-50 text-gray-700'
              : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
          )}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🪦</span>
            <div className="text-left">
              <div className="font-medium">RIP</div>
              <div className="text-xs text-gray-500">Rest in peace, startup</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {userReaction === 'downvote' ? (
              <HandThumbDownSolidIcon className="h-5 w-5" />
            ) : (
              <HandThumbDownIcon className="h-5 w-5" />
            )}
            <span className="font-bold">{reactions.downvotes || 0}</span>
          </div>
        </motion.button>

      </div>

      {/* Total reactions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 text-center">
          {(reactions.upvotes || 0) + (reactions.downvotes || 0)} total reactions
        </div>
      </div>
    </div>
  )
}

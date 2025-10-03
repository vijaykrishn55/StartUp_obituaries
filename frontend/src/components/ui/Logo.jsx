import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const logoSizes = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8', 
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}

export default function Logo({
  size = 'md',
  variant = 'default',
  animated = true,
  className,
  onClick
}) {
  const LogoComponent = animated ? motion.div : 'div'
  
  const motionProps = animated ? {
    whileHover: { 
      scale: 1.05,
      rotate: [0, -2, 2, 0],
      transition: { duration: 0.4 }
    },
    whileTap: { scale: 0.95 },
    initial: { opacity: 0, scale: 0.8, y: -10 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.1 
      }
    }
  } : {}

  const getLogoColors = () => {
    switch (variant) {
      case 'white':
        return {
          tombstone: 'fill-white',
          cross: 'fill-gray-200',
          text: 'fill-white',
          flowers: 'fill-gray-300',
          ground: 'stroke-gray-300'
        }
      case 'monochrome':
        return {
          tombstone: 'fill-gray-600',
          cross: 'fill-gray-400',
          text: 'fill-gray-800',
          flowers: 'fill-gray-500',
          ground: 'stroke-gray-400'
        }
      case 'gradient':
        return {
          tombstone: 'fill-gradient-to-br from-gray-700 to-gray-900',
          cross: 'fill-primary-500',
          text: 'fill-primary-600',
          flowers: 'fill-red-500',
          ground: 'stroke-primary-400'
        }
      default:
        return {
          tombstone: 'fill-gray-700',
          cross: 'fill-primary-500',
          text: 'fill-primary-600',
          flowers: 'fill-red-500',
          ground: 'stroke-gray-400'
        }
    }
  }

  const colors = getLogoColors()

  return (
    <LogoComponent
      className={cn(
        logoSizes[size],
        'flex-shrink-0 cursor-pointer',
        className
      )}
      onClick={onClick}
      {...(animated ? motionProps : {})}
    >
      <svg
        viewBox="0 0 48 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {/* Tombstone shadow */}
        <motion.ellipse
          cx="24"
          cy="52"
          rx="18"
          ry="2"
          className="fill-black/10"
          initial={animated ? { scaleX: 0 } : undefined}
          animate={animated ? { scaleX: 1 } : undefined}
          transition={animated ? { delay: 0.1, duration: 0.3 } : undefined}
        />

        {/* Tombstone base */}
        <motion.rect
          x="10"
          y="32"
          width="28"
          height="18"
          rx="2"
          className={colors.tombstone}
          initial={animated ? { scaleY: 0, originY: 1 } : undefined}
          animate={animated ? { scaleY: 1 } : undefined}
          transition={animated ? { delay: 0.2, duration: 0.4 } : undefined}
        />
        
        {/* Tombstone top (rounded) */}
        <motion.rect
          x="10"
          y="8"
          width="28"
          height="28"
          rx="14"
          className={colors.tombstone}
          initial={animated ? { scale: 0 } : undefined}
          animate={animated ? { scale: 1 } : undefined}
          transition={animated ? { delay: 0.15, duration: 0.4, type: "spring" } : undefined}
        />

        {/* Skull design instead of cross */}
        <motion.g
          initial={animated ? { opacity: 0, y: -3 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={animated ? { delay: 0.5, duration: 0.3 } : undefined}
        >
          {/* Skull outline */}
          <circle cx="24" cy="20" r="8" className={colors.cross} />
          <ellipse cx="24" cy="24" rx="6" ry="4" className={colors.cross} />
          
          {/* Eye sockets */}
          <circle cx="21" cy="18" r="2" className="fill-current text-gray-900" />
          <circle cx="27" cy="18" r="2" className="fill-current text-gray-900" />
          
          {/* Nasal cavity */}
          <path d="M24 21 L22 24 L26 24 Z" className="fill-current text-gray-900" />
          
          {/* Teeth/jaw */}
          <rect x="22" y="26" width="1" height="2" className="fill-current text-gray-900" />
          <rect x="24" y="26" width="1" height="2" className="fill-current text-gray-900" />
          <rect x="26" y="26" width="1" height="2" className="fill-current text-gray-900" />
        </motion.g>

        {/* "RIP" text */}
        <motion.text
          x="24"
          y="42"
          textAnchor="middle"
          className={cn("text-xs font-bold", colors.text)}
          fontSize="7"
          fontFamily="serif"
          initial={animated ? { opacity: 0 } : undefined}
          animate={animated ? { opacity: 1 } : undefined}
          transition={animated ? { delay: 0.7, duration: 0.3 } : undefined}
        >
          RIP
        </motion.text>

        {/* Decorative flowers */}
        <motion.g
          initial={animated ? { opacity: 0, scale: 0 } : undefined}
          animate={animated ? { opacity: 1, scale: 1 } : undefined}
          transition={animated ? { delay: 0.9, duration: 0.4 } : undefined}
        >
          {/* Left flowers */}
          <g>
            <circle cx="6" cy="44" r="2" className={colors.flowers} />
            <circle cx="4" cy="42" r="1.5" className={colors.flowers} />
            <circle cx="8" cy="42" r="1.5" className={colors.flowers} />
            <circle cx="6" cy="40" r="1" className={colors.flowers} />
          </g>
          
          {/* Right flowers */}
          <g>
            <circle cx="42" cy="44" r="2" className={colors.flowers} />
            <circle cx="40" cy="42" r="1.5" className={colors.flowers} />
            <circle cx="44" cy="42" r="1.5" className={colors.flowers} />
            <circle cx="42" cy="40" r="1" className={colors.flowers} />
          </g>
        </motion.g>

        {/* Ground line */}
        <motion.line
          x1="2"
          y1="50"
          x2="46"
          y2="50"
          strokeWidth="1.5"
          className={colors.ground}
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={animated ? { delay: 1.1, duration: 0.6 } : undefined}
        />

        {/* Floating spirits/particles for startup souls */}
        {animated && (
          <>
            <motion.circle
              cx="14"
              cy="12"
              r="0.8"
              className="fill-primary-400 opacity-70"
              animate={{
                y: [-2, -8, -2],
                x: [-1, 1, -1],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 1.5,
                ease: "easeInOut"
              }}
            />
            <motion.circle
              cx="34"
              cy="10"
              r="0.6"
              className="fill-red-400 opacity-60"
              animate={{
                y: [-1, -6, -1],
                x: [1, -1, 1],
                opacity: [0.2, 0.7, 0.2],
                scale: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 2,
                ease: "easeInOut"
              }}
            />
            <motion.circle
              cx="24"
              cy="6"
              r="0.5"
              className="fill-yellow-400 opacity-50"
              animate={{
                y: [-1.5, -5, -1.5],
                opacity: [0.2, 0.6, 0.2],
                scale: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                delay: 2.5,
                ease: "easeInOut"
              }}
            />
          </>
        )}

        {/* Subtle glow effect */}
        {animated && (
          <motion.circle
            cx="24"
            cy="22"
            r="12"
            className="fill-primary-200 opacity-20"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 0.3, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.8,
              ease: "easeOut"
            }}
          />
        )}
      </svg>
    </LogoComponent>
  )
}
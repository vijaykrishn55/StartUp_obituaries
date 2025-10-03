import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import Logo from './Logo'

const textSizes = {
  sm: {
    title: 'text-lg',
    subtitle: 'text-xs',
    logo: 'sm'
  },
  md: {
    title: 'text-xl',
    subtitle: 'text-xs',
    logo: 'md'
  },
  lg: {
    title: 'text-2xl',
    subtitle: 'text-sm',
    logo: 'lg'
  },
  xl: {
    title: 'text-3xl',
    subtitle: 'text-base',
    logo: 'xl'
  }
}

export default function LogoText({
  size = 'md',
  variant = 'default',
  animated = true,
  orientation = 'horizontal',
  className,
  onClick
}) {
  const TextComponent = animated ? motion.div : 'div'
  const sizes = textSizes[size]
  
  const getTextColors = () => {
    switch (variant) {
      case 'white':
        return {
          title: 'text-white',
          subtitle: 'text-gray-200'
        }
      case 'monochrome':
        return {
          title: 'text-gray-800',
          subtitle: 'text-gray-600'
        }
      default:
        return {
          title: 'text-gray-900',
          subtitle: 'text-gray-500'
        }
    }
  }

  const colors = getTextColors()
  
  const titleVariants = animated ? {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { delay: 0.2, duration: 0.5 }
    }
  } : {}

  const subtitleVariants = animated ? {
    initial: { opacity: 0, x: -15 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { delay: 0.4, duration: 0.5 }
    }
  } : {}

  if (orientation === 'vertical') {
    return (
      <TextComponent
        className={cn(
          'flex flex-col items-center space-y-2 cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        <Logo 
          size={sizes.logo} 
          variant={variant} 
          animated={animated}
        />
        <div className="text-center">
          <motion.div
            className={cn('font-bold', sizes.title, colors.title)}
            {...(animated ? titleVariants : {})}
          >
            Startup Obituaries
          </motion.div>
          <motion.div
            className={cn('font-medium', sizes.subtitle, colors.subtitle)}
            {...(animated ? subtitleVariants : {})}
          >
            Where failure becomes wisdom
          </motion.div>
        </div>
      </TextComponent>
    )
  }

  return (
    <TextComponent
      className={cn(
        'flex items-center space-x-3 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <Logo 
        size={sizes.logo} 
        variant={variant} 
        animated={animated}
      />
      <div className="flex flex-col">
        <motion.div
          className={cn('font-bold leading-tight', sizes.title, colors.title)}
          {...(animated ? titleVariants : {})}
        >
          Startup Obituaries
        </motion.div>
        <motion.div
          className={cn('font-medium leading-tight', sizes.subtitle, colors.subtitle)}
          {...(animated ? subtitleVariants : {})}
        >
          Where failure becomes wisdom
        </motion.div>
      </div>
    </TextComponent>
  )
}
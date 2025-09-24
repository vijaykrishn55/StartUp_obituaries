import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export function Card({ className, children, hover = true, ...props }) {
  return (
    <motion.div
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        hover && "hover:shadow-md transition-shadow duration-200",
        className
      )}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("p-6 pb-4", className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-lg font-semibold text-gray-900", className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-sm text-gray-600 mt-1", className)} {...props}>
      {children}
    </p>
  )
}

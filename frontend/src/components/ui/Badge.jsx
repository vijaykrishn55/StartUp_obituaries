import { cn } from '../../lib/utils'

const badgeVariants = {
  default: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  primary: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  success: "bg-green-100 text-green-800 hover:bg-green-200",
  warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  danger: "bg-red-100 text-red-800 hover:bg-red-200",
  purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  orange: "bg-orange-100 text-orange-800 hover:bg-orange-200",
}

const badgeSizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
}

export function Badge({ 
  className, 
  variant = "default", 
  size = "sm",
  children, 
  ...props 
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors",
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

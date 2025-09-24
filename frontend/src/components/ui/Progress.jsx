import { cn } from '../../lib/utils'

export function Progress({ className, value = 0, max = 100, ...props }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

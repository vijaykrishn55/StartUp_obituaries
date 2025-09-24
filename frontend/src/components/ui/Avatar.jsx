import { cn } from '../../lib/utils'

const avatarSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10", 
  lg: "h-12 w-12",
  xl: "h-16 w-16",
  "2xl": "h-20 w-20"
}

export function Avatar({ className, size = "md", src, alt, fallback, ...props }) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-gray-100 overflow-hidden",
        avatarSizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={cn(
          "font-medium text-gray-600",
          size === "sm" && "text-xs",
          size === "md" && "text-sm", 
          size === "lg" && "text-base",
          size === "xl" && "text-lg",
          size === "2xl" && "text-xl"
        )}>
          {fallback}
        </span>
      )}
    </div>
  )
}

import { ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

export default function ErrorMessage({ 
  error, 
  onDismiss, 
  className = '',
  variant = 'error' // error, warning, info
}) {
  if (!error) return null

  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || error.error || 'An unexpected error occurred'

  const variants = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-400'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200', 
      text: 'text-yellow-800',
      icon: 'text-yellow-400'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800', 
      icon: 'text-blue-400'
    }
  }

  const styles = variants[variant]

  return (
    <div className={clsx(
      'rounded-md border p-4',
      styles.bg,
      styles.border,
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon className={clsx('h-5 w-5', styles.icon)} />
        </div>
        <div className="ml-3 flex-1">
          <p className={clsx('text-sm font-medium', styles.text)}>
            {errorMessage}
          </p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={clsx(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  styles.text,
                  'hover:bg-red-100 focus:ring-red-600'
                )}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

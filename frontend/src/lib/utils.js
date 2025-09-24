import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { failureReasonColors, failureReasonColorsCard } from './constants'

// Utility function for conditional class names
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Get failure reason styling for detail pages (with borders)
export const getFailureReasonStyle = (reason) => {
  return failureReasonColors[reason] || 'bg-gray-100 text-gray-800 border-gray-200'
}

// Get failure reason styling for cards (without borders)
export const getFailureReasonCardStyle = (reason) => {
  return failureReasonColorsCard[reason] || 'bg-gray-100 text-gray-800'
}

// Format currency
export const formatCurrency = (amount) => {
  if (!amount) return '$0'
  
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  
  return `$${amount.toLocaleString()}`
}

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format relative time
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Unknown'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(dateString)
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

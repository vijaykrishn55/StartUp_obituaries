// Shared constants for the application

export const failureReasonColors = {
  'Ran out of funding': 'bg-red-100 text-red-800 border-red-200',
  'No Product-Market Fit': 'bg-orange-100 text-orange-800 border-orange-200',
  'Poor Unit Economics': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Technical Debt': 'bg-purple-100 text-purple-800 border-purple-200',
  'Bad Timing': 'bg-blue-100 text-blue-800 border-blue-200',
  'Got outcompeted': 'bg-green-100 text-green-800 border-green-200',
  'Regulatory issues': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Team conflicts': 'bg-pink-100 text-pink-800 border-pink-200',
  'Market downturn': 'bg-gray-100 text-gray-800 border-gray-200'
}

export const failureReasonColorsCard = {
  'Ran out of funding': 'bg-red-100 text-red-800',
  'No Product-Market Fit': 'bg-orange-100 text-orange-800',
  'Poor Unit Economics': 'bg-yellow-100 text-yellow-800',
  'Technical Debt': 'bg-purple-100 text-purple-800',
  'Bad Timing': 'bg-blue-100 text-blue-800',
  'Got outcompeted': 'bg-green-100 text-green-800',
  'Regulatory issues': 'bg-indigo-100 text-indigo-800',
  'Team conflicts': 'bg-pink-100 text-pink-800',
  'Market downturn': 'bg-gray-100 text-gray-800'
}

export const reactionTypes = {
  upvote: { emoji: '💡', label: 'Brilliant Mistake', description: 'This failure taught valuable lessons' },
  downvote: { emoji: '🪦', label: 'RIP', description: 'This startup deserved to fail' },
  pivot: { emoji: '🔁', label: 'Deserved Pivot', description: 'Should have pivoted earlier' }
}

export const startupStages = [
  'Idea',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D+',
  'IPO',
  'Acquired'
]

export const FAILURE_REASONS = [
  'Ran out of funding',
  'No Product-Market Fit',
  'Poor Unit Economics',
  'Co-founder Conflict',
  'Technical Debt',
  'Got outcompeted',
  'Bad Timing',
  'Legal/Regulatory Issues',
  'Pivot Fatigue',
  'Other'
]

export const STARTUP_STAGES = [
  'Idea',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B+',
  'IPO',
  'Acquired'
]

export const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Entertainment',
  'Transportation',
  'Real Estate',
  'Food & Beverage',
  'Gaming',
  'Social Media',
  'Consumer Electronics',
  'Other'
]

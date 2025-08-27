import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { startupsAPI } from '../lib/api'
import { useAuthStore } from '../stores/authStore'

const steps = [
  { id: 1, name: 'Basic Information', description: 'Tell us about your startup' },
  { id: 2, name: 'Failure Analysis', description: 'What went wrong?' },
  { id: 3, name: 'Metrics & Funding', description: 'Numbers and investors' },
  { id: 4, name: 'Lessons Learned', description: 'Share your wisdom' },
]

const failureReasons = [
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

const stages = [
  'Idea',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B+'
]

export default function CreateStartupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    mode: 'onChange'
  })

  const watchedValues = watch()

  const validateStep = async (step) => {
    const fieldsToValidate = {
      1: ['name', 'description', 'industry', 'founded_year', 'died_year'],
      2: ['primary_failure_reason', 'autopsy_report', 'stage_at_death'],
      3: [], // Optional fields
      4: ['lessons_learned']
    }

    const fields = fieldsToValidate[step]
    if (fields.length === 0) return true
    
    return await trigger(fields)
  }

  const nextStep = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Convert string numbers to integers
      const formattedData = {
        ...data,
        founded_year: parseInt(data.founded_year),
        died_year: parseInt(data.died_year),
        funding_amount_usd: data.funding_amount_usd ? parseFloat(data.funding_amount_usd) : null,
        key_investors: data.key_investors ? data.key_investors.split(',').map(inv => inv.trim()) : [],
        links: data.links ? data.links.split(',').map(link => link.trim()) : [],
        is_anonymous: data.is_anonymous || false
      }

      const response = await startupsAPI.createStartup(formattedData)
      navigate(`/startup/${response.data.startup.id}`)
    } catch (error) {
      console.error('Failed to create startup:', error)
      alert('Failed to create startup obituary. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Startup Name *
              </label>
              <input
                {...register('name', { required: 'Startup name is required' })}
                type="text"
                className="input"
                placeholder="e.g., TechFlow, DataViz Pro"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="input"
                placeholder="Brief description of what your startup did..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <input
                  {...register('industry', { required: 'Industry is required' })}
                  type="text"
                  className="input"
                  placeholder="e.g., FinTech, HealthTech, SaaS"
                />
                {errors.industry && (
                  <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vision
                </label>
                <input
                  {...register('vision')}
                  type="text"
                  className="input"
                  placeholder="What was your big vision?"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Founded Year *
                </label>
                <input
                  {...register('founded_year', { 
                    required: 'Founded year is required',
                    min: { value: 1990, message: 'Year must be 1990 or later' },
                    max: { value: new Date().getFullYear(), message: 'Year cannot be in the future' }
                  })}
                  type="number"
                  className="input"
                  placeholder="2020"
                />
                {errors.founded_year && (
                  <p className="mt-1 text-sm text-red-600">{errors.founded_year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Died Year *
                </label>
                <input
                  {...register('died_year', { 
                    required: 'Died year is required',
                    min: { value: 1990, message: 'Year must be 1990 or later' },
                    max: { value: new Date().getFullYear(), message: 'Year cannot be in the future' }
                  })}
                  type="number"
                  className="input"
                  placeholder="2023"
                />
                {errors.died_year && (
                  <p className="mt-1 text-sm text-red-600">{errors.died_year.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                {...register('is_anonymous')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Post anonymously
              </label>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Failure Reason *
              </label>
              <select
                {...register('primary_failure_reason', { required: 'Please select a failure reason' })}
                className="input"
              >
                <option value="">Select a reason...</option>
                {failureReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              {errors.primary_failure_reason && (
                <p className="mt-1 text-sm text-red-600">{errors.primary_failure_reason.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage at Death *
              </label>
              <select
                {...register('stage_at_death', { required: 'Please select the stage' })}
                className="input"
              >
                <option value="">Select stage...</option>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              {errors.stage_at_death && (
                <p className="mt-1 text-sm text-red-600">{errors.stage_at_death.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Autopsy Report *
              </label>
              <div className="flex items-start space-x-2 mb-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Provide a detailed analysis of what went wrong. Be honest and specific.
                </p>
              </div>
              <textarea
                {...register('autopsy_report', { required: 'Autopsy report is required' })}
                rows={6}
                className="input"
                placeholder="Describe in detail what led to the failure. What were the warning signs? What decisions contributed to the downfall?"
              />
              {errors.autopsy_report && (
                <p className="mt-1 text-sm text-red-600">{errors.autopsy_report.message}</p>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Funding (USD)
              </label>
              <input
                {...register('funding_amount_usd')}
                type="number"
                className="input"
                placeholder="1000000"
              />
              <p className="mt-1 text-sm text-gray-500">Leave blank if no funding was raised</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Investors
              </label>
              <input
                {...register('key_investors')}
                type="text"
                className="input"
                placeholder="Sequoia Capital, Andreessen Horowitz, Angel Investor"
              />
              <p className="mt-1 text-sm text-gray-500">Separate multiple investors with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peak Metrics
              </label>
              <textarea
                {...register('peak_metrics')}
                rows={3}
                className="input"
                placeholder="e.g., 10K users, $50K MRR, 500K page views/month"
              />
              <p className="mt-1 text-sm text-gray-500">Describe your best metrics before the decline</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relevant Links
              </label>
              <input
                {...register('links')}
                type="text"
                className="input"
                placeholder="https://techcrunch.com/article, https://github.com/repo"
              />
              <p className="mt-1 text-sm text-gray-500">Separate multiple links with commas</p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lessons Learned *
              </label>
              <div className="flex items-start space-x-2 mb-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Share the key insights and lessons that others can learn from your experience.
                </p>
              </div>
              <textarea
                {...register('lessons_learned', { required: 'Please share your lessons learned' })}
                rows={6}
                className="input"
                placeholder="What would you do differently? What advice would you give to other founders? What patterns did you notice?"
              />
              {errors.lessons_learned && (
                <p className="mt-1 text-sm text-red-600">{errors.lessons_learned.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advice for Founders
              </label>
              <textarea
                {...register('advice_for_founders')}
                rows={4}
                className="input"
                placeholder="Any specific advice you'd give to founders in similar situations?"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Review Your Story</h3>
              <p className="text-sm text-blue-700">
                Take a moment to review all the information you've provided. Once submitted, 
                your startup obituary will be visible to the community and can help others 
                learn from your experience.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Share Your Startup Story</h1>
        <p className="mt-2 text-gray-600">
          Help the community learn from your experience by sharing your startup's journey
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  {stepIdx !== steps.length - 1 && (
                    <div className={`h-0.5 w-full ${currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className={`relative w-8 h-8 flex items-center justify-center rounded-full ${
                  currentStep > step.id 
                    ? 'bg-primary-600 text-white' 
                    : currentStep === step.id 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white border-2 border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="mt-2">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-primary-600' : 'text-gray-500'}`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card mb-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {steps[currentStep - 1].name}
            </h2>
            {renderStepContent()}
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`btn-outline flex items-center ${
              currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary flex items-center"
            >
              Next
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publishing...
                </>
              ) : (
                <>
                  Publish Story
                  <CheckIcon className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

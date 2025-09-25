import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { startupsAPI } from '../lib/api'
import { FAILURE_REASONS, STARTUP_STAGES } from '../lib/constants'
import LogoUpload from '../components/LogoUpload'
import StartupFormFieldAssistant from '../components/StartupFormFieldAssistant'
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  InformationCircleIcon,
  PhotoIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
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
  const [createdStartupId, setCreatedStartupId] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get pre-filled data from navigation state (if coming from AI form)
  const prefilledData = location.state?.prefilledData || null
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    mode: 'onChange',
    defaultValues: prefilledData || {}
  })

  const watchedValues = watch()

  // Set form values when pre-filled data is available
  useEffect(() => {
    if (prefilledData) {
      Object.entries(prefilledData).forEach(([key, value]) => {
        setValue(key, value)
      })
      
      // Show a notification that the form has been pre-filled
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50'
      notification.innerHTML = '✅ Form pre-filled with AI-generated content!'
      document.body.appendChild(notification)
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 3000)
    }
  }, [prefilledData, setValue])

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

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setLogoFile(file)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setLogoFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
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
      const startupId = response.data.id
      setCreatedStartupId(startupId)
      
      // Upload logo if one was selected
      if (logoFile) {
        try {
          const formData = new FormData()
          formData.append('logo', logoFile)
          await startupsAPI.uploadLogo(startupId, formData)
        } catch (logoError) {
          console.error('Failed to upload logo:', logoError)
          // Don't fail the entire process if logo upload fails
          alert('Startup created successfully, but logo upload failed. You can upload it later from the startup page.')
        }
      }
      
      navigate(`/startup/${startupId}`)
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

            {/* Logo Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Startup Logo (Optional)
              </label>
              
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null)
                      setLogoPreview(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div className="space-y-2">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                </div>
              )}
              
              {logoPreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Change Logo
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <StartupFormFieldAssistant 
                  fieldName="Description"
                  fieldValue={watchedValues.description}
                  startupContext={`${watchedValues.name || 'Startup'} in ${watchedValues.industry || 'tech'} industry`}
                  onUpdateField={(newValue) => {
                    setValue('description', newValue);
                  }}
                />
              </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Vision
                  </label>
                  <StartupFormFieldAssistant 
                    fieldName="Vision"
                    fieldValue={watchedValues.vision}
                    startupContext={`${watchedValues.name || 'Startup'} in ${watchedValues.industry || 'tech'} industry`}
                    onUpdateField={(newValue) => {
                      setValue('vision', newValue);
                    }}
                  />
                </div>
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Autopsy Report *
                </label>
                <StartupFormFieldAssistant 
                  fieldName="Autopsy Report"
                  fieldValue={watchedValues.autopsy_report}
                  startupContext={`${watchedValues.name || 'Startup'} in ${watchedValues.industry || 'tech'} industry with failure reason: ${watchedValues.primary_failure_reason || 'unknown'}`}
                  onUpdateField={(newValue) => {
                    setValue('autopsy_report', newValue);
                  }}
                />
              </div>
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Peak Metrics
                </label>
                <StartupFormFieldAssistant 
                  fieldName="Peak Metrics"
                  fieldValue={watchedValues.peak_metrics}
                  startupContext={`${watchedValues.name || 'Startup'} in ${watchedValues.industry || 'tech'} industry with stage: ${watchedValues.stage_at_death || 'unknown'} and funding: ${watchedValues.funding_amount_usd || 'unknown'}`}
                  onUpdateField={(newValue) => {
                    setValue('peak_metrics', newValue);
                  }}
                />
              </div>
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
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700 flex-1">
                  Lessons Learned *
                </label>
                <StartupFormFieldAssistant 
                  fieldName="Lessons Learned"
                  fieldValue={watchedValues.lessons_learned}
                  startupContext={`${watchedValues.name || 'Startup'} in ${watchedValues.industry || 'tech'} industry with failure reason: ${watchedValues.primary_failure_reason || 'unknown'} and autopsy report: ${watchedValues.autopsy_report?.substring(0, 200) || 'not provided'}`}
                  onUpdateField={(newValue) => {
                    const event = { target: { value: newValue } };
                    register('lessons_learned').onChange(event);
                  }}
                />
              </div>
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
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700 flex-1">
                  Advice for Founders
                </label>
                <StartupFormFieldAssistant 
                  fieldName="Advice for Founders"
                  fieldValue={watchedValues.advice_for_founders}
                  startupContext={`${watchedValues.name || 'Startup'} in ${watchedValues.industry || 'tech'} industry with lessons learned: ${watchedValues.lessons_learned || 'not provided'}`}
                  onUpdateField={(newValue) => {
                    const event = { target: { value: newValue } };
                    register('advice_for_founders').onChange(event);
                  }}
                />
              </div>
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

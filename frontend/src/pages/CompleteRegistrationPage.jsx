import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import LogoText from '../components/ui/LogoText'
import toast from 'react-hot-toast'

export default function CompleteRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { user, completeRegistration } = useAuthStore()
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm()

  useEffect(() => {
    if (user && user.displayName) {
      const names = user.displayName.split(' ')
      setValue('first_name', names[0] || '')
      setValue('last_name', names.slice(1).join(' ') || '')
    }
    if (user && user.email) {
      setValue('email', user.email)
    }
  }, [user, setValue])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Map form data to match the expected format for the backend
      const formattedData = {
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        user_role: data.role || 'student',
        bio: data.bio || '',
        // Include any other fields as needed
      }
      
      const result = await completeRegistration(formattedData)
      if (result.success) {
        toast.success('Welcome to Startup Obituaries!')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Registration completion failed:', error)
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Left side - Image/Quote - Fixed/Sticky */}
      <div className="hidden lg:block lg:w-3/5">
        <div className="fixed inset-y-0 left-0 w-3/5 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative h-full flex items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center text-white"
            >
              <blockquote className="text-2xl font-medium mb-6">
                "The greatest teacher, failure is. Learning from failure leads to success."
              </blockquote>
              <cite className="text-lg opacity-80">— Yoda</cite>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right side - Form - Scrollable */}
      <div className="w-full lg:w-2/5 lg:ml-auto min-h-screen flex flex-col justify-start py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <LogoText size="lg" animated={true} />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Complete your profile
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Just a few more details to get you started
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('first_name', { required: 'First name is required' })}
                      type="text"
                      autoComplete="given-name"
                      className="input"
                      placeholder="First name"
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('last_name', { required: 'Last name is required' })}
                      type="text"
                      autoComplete="family-name"
                      className="input"
                      placeholder="Last name"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="input"
                    disabled
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    {...register('username', { 
                      required: 'Username is required',
                      minLength: { value: 3, message: 'Username must be at least 3 characters' }
                    })}
                    type="text"
                    autoComplete="username"
                    className="input"
                    placeholder="Choose a username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    {...register('bio')}
                    rows={3}
                    className="input"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <div className="mt-1">
                  <select
                    {...register('role', { required: 'Please select your role' })}
                    className="input"
                  >
                    <option value="">Select your role</option>
                    <option value="founder">Founder</option>
                    <option value="investor">Investor</option>
                    <option value="employee">Employee</option>
                    <option value="advisor">Advisor</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex justify-center py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Setting up your account...
                    </div>
                  ) : (
                    'Complete registration'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
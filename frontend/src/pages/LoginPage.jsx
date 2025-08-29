import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error } = useAuthStore()
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    const result = await login(data)
    if (result.success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-3xl">💀</span>
              <span className="ml-2 text-2xl font-bold text-gray-900">Startup Obituaries</span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    autoComplete="email"
                    className="input"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </a>
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
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Image/Quote */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative h-full flex items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center text-white"
            >
              <blockquote className="text-2xl font-medium mb-6">
                "Failure is simply the opportunity to begin again, this time more intelligently."
              </blockquote>
              <cite className="text-lg opacity-80">— Henry Ford</cite>
              
              <div className="mt-12 grid grid-cols-2 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold">1,247</div>
                  <div className="text-sm opacity-80">Stories Shared</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">12,456</div>
                  <div className="text-sm opacity-80">Lessons Learned</div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="text-center space-y-2 mt-6">
            <p className="text-sm text-gray-600">
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

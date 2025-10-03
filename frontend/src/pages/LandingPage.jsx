import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  LightBulbIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import LogoText from '../components/ui/LogoText'
import Logo from '../components/ui/Logo'

const features = [
  {
    name: 'Share Your Story',
    description: 'Turn your startup failure into valuable lessons for the community.',
    icon: HeartIcon,
  },
  {
    name: 'Learn from Others',
    description: 'Discover why startups fail and what you can learn from their mistakes.',
    icon: LightBulbIcon,
  },
  {
    name: 'Connect & Network',
    description: 'Build meaningful connections with fellow entrepreneurs and founders.',
    icon: UserGroupIcon,
  },
  {
    name: 'Track Insights',
    description: 'Analyze failure patterns and trends across industries and stages.',
    icon: ChartBarIcon,
  },
]

const stats = [
  { name: 'Startup Obituaries', value: '1,247' },
  { name: 'Lessons Learned', value: '3,891' },
  { name: 'Community Members', value: '12,456' },
  { name: 'Industries Covered', value: '89' },
]

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/70 backdrop-blur-lg">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <LogoText size="lg" animated={true} />
            </Link>
          </div>
          <div className="flex lg:flex-1 lg:justify-end space-x-4">
            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600">
              Log in
            </Link>
            <Link to="/register" className="btn-primary">
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-400 to-primary-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              Where Failure Becomes{' '}
              <span className="text-primary-600">Wisdom</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="mt-8 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
            >
              Share your startup's story, learn from others' failures, and build meaningful connections 
              in the entrepreneurial community. Turn setbacks into comebacks.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              className="mt-12 flex items-center justify-center gap-x-6"
            >
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Share Your Story
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/login" className="text-lg font-semibold leading-6 text-gray-900 hover:text-primary-600">
                Browse Stories <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="mx-auto flex max-w-xs flex-col gap-y-4"
              >
                <dt className="text-base leading-7 text-gray-600">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>

      {/* Features section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Learn & Connect</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to turn failure into wisdom
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join a community of entrepreneurs who believe that failure is just another step 
              towards success. Share, learn, and grow together.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {features.map((feature, index) => (
                <motion.div 
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative pl-16"
                >
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            {/* Animated logo for CTA section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex justify-center mb-8"
            >
              <Logo 
                size="xl" 
                animated={true} 
                variant="default"
                className="drop-shadow-xl filter brightness-110 contrast-110"
              />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Ready to share your story?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100"
            >
              Join thousands of entrepreneurs who are turning their failures into valuable lessons 
              for the community.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-50 focus:ring-white">
                Get started today
              </Link>
              <Link to="/login" className="text-sm font-semibold leading-6 text-white hover:text-primary-100">
                Already have an account? <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

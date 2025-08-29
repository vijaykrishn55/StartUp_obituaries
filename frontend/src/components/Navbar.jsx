import { Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-primary-600">💀</span>
              </div>
              <div className="ml-2">
                <h1 className="text-xl font-bold text-gray-900">Startup Obituaries</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Where failure becomes wisdom</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
            </button>

            {/* User menu */}
            <Menu as="div" className="relative ml-3">
              <div>
                <Menu.Button className="flex items-center space-x-2 rounded-full bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <span className="hidden md:block text-gray-700 font-medium">
                    {user?.first_name || user?.username}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={cn(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        Your Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/my-startups"
                        className={cn(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        My Startups
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={cn(
                          active ? 'bg-gray-100' : '',
                          'block w-full text-left px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  )
}

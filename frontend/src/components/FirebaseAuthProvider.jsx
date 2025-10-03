import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import useFirebaseAuth from '../hooks/useFirebaseAuth'
import { useAuthStore } from '../stores/authStore'

export default function FirebaseAuthProvider({ children }) {
  const firebaseAuth = useFirebaseAuth()
  const { setFirebaseAuth } = useAuthStore()

  useEffect(() => {
    // Update the auth store with Firebase auth state
    setFirebaseAuth(firebaseAuth)
  }, [firebaseAuth.user, firebaseAuth.profile, firebaseAuth.loading, firebaseAuth.error, setFirebaseAuth])

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  )
}
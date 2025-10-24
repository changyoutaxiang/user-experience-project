/**
 * Main App component.
 */
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { AppRouter } from '@/routes'
import './index.css'

function App() {
  const { initAuth } = useAuthStore()

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    initAuth()
  }, [initAuth])

  return <AppRouter />
}

export default App

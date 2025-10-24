/**
 * Zustand store for authentication state management.
 */
import { create } from 'zustand'
import { User } from '@/types/user'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  initAuth: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem('access_token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  initAuth: () => {
    const token = localStorage.getItem('access_token')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User
        set({ user, token, isAuthenticated: true })
      } catch {
        // Invalid data in localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
    }
  },
}))

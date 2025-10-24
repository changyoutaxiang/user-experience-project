/**
 * Custom hook for authentication operations.
 */
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import { LoginCredentials, AuthResponse, User, UserCreateRequest } from '@/types/user'

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore()

  const login = async (credentials: LoginCredentials) => {
    try {
      // FastAPI OAuth2PasswordRequestForm expects form data
      const formData = new FormData()
      formData.append('username', credentials.username)
      formData.append('password', credentials.password)

      const response = await api.post<AuthResponse>('/api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const { access_token, user: userData } = response.data
      setAuth(userData, access_token)

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/api/v1/auth/logout')
    } catch {
      // Logout on client side even if API call fails
    } finally {
      clearAuth()
    }
  }

  const register = async (userData: UserCreateRequest) => {
    try {
      const response = await api.post<User>('/api/v1/auth/register', userData)

      return {
        success: true,
        user: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      }
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    register,
  }
}

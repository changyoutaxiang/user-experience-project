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
      // 发送 JSON 格式的登录请求
      const response = await api.post<AuthResponse>('/api/v1/auth/login', {
        email: credentials.username,
        password: credentials.password,
      })

      const { access_token, user: userData } = response.data
      setAuth(userData, access_token)

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Login failed',
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
        error: error.response?.data?.error || error.response?.data?.detail || '注册失败',
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

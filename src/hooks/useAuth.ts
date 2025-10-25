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
      // 使用 JSON 格式发送登录请求
      const response = await api.post<AuthResponse>('/v1/auth/login', {
        email: credentials.username,  // username 字段映射到 email
        password: credentials.password,
      })

      const { access_token, user: userData } = response.data
      setAuth(userData, access_token)

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || '登录失败',
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/v1/auth/logout')
    } catch {
      // Logout on client side even if API call fails
    } finally {
      clearAuth()
    }
  }

  const register = async (userData: UserCreateRequest) => {
    try {
      const response = await api.post<User>('/v1/auth/register', userData)

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

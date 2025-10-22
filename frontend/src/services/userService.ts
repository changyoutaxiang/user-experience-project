/**
 * User API service client.
 */
import { api } from './api'
import { User, UserCreateRequest, UserUpdateRequest, UserRole } from '@/types/user'

export const userService = {
  /**
   * List all users
   */
  async listUsers(params?: {
    is_active?: boolean
    skip?: number
    limit?: number
  }): Promise<User[]> {
    const response = await api.get<User[]>('/api/v1/users', { params })
    return response.data
  },

  /**
   * Get a user by ID
   */
  async getUser(userId: string): Promise<User> {
    const response = await api.get<User>(`/api/v1/users/${userId}`)
    return response.data
  },

  /**
   * Create a new user
   */
  async createUser(data: UserCreateRequest): Promise<User> {
    const response = await api.post<User>('/api/v1/users', data)
    return response.data
  },

  /**
   * Update a user
   */
  async updateUser(userId: string, data: UserUpdateRequest): Promise<User> {
    const response = await api.patch<User>(`/api/v1/users/${userId}`, data)
    return response.data
  },

  /**
   * Delete (deactivate) a user
   */
  async deleteUser(userId: string): Promise<User> {
    const response = await api.delete<User>(`/api/v1/users/${userId}`)
    return response.data
  },

  /**
   * Update a user's role
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    const response = await api.patch<User>(`/api/v1/users/${userId}/role`, null, {
      params: { new_role: newRole }
    })
    return response.data
  },
}

/**
 * Dashboard API service.
 */
import api from './api'
import { DashboardStats } from '@/types/api'

export const dashboardService = {
  /**
   * Get dashboard statistics.
   */
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/api/v1/dashboard')
    return response.data
  },

  /**
   * Get dashboard statistics (alias).
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/api/v1/dashboard/stats')
    return response.data
  },
}

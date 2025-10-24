/**
 * Custom hook for dashboard data.
 */
import { useState, useEffect } from 'react'
import { DashboardStats } from '@/types/api'
import { dashboardService } from '@/services/dashboardService'

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardService.getStats()
      setStats(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}

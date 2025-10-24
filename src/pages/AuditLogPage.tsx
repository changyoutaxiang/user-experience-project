/**
 * AuditLog page for viewing system audit logs.
 */
import { useState, useEffect } from 'react'
import { AuditLog, AuditLogFilters } from '@/types/auditLog'
import { auditLogService } from '@/services/auditLogService'

export const AuditLogPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AuditLogFilters>({
    skip: 0,
    limit: 50,
  })

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await auditLogService.listAuditLogs(filters)
      setLogs(data.items)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.response?.data?.detail || '获取审计日志失败')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      skip: 0, // Reset pagination when filters change
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      skip: 0,
      limit: 50,
    })
  }

  const handleNextPage = () => {
    setFilters((prev) => ({
      ...prev,
      skip: (prev.skip || 0) + (prev.limit || 50),
    }))
  }

  const handlePrevPage = () => {
    setFilters((prev) => ({
      ...prev,
      skip: Math.max(0, (prev.skip || 0) - (prev.limit || 50)),
    }))
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getActionTypeDisplay = (actionType: string) => {
    const actionMap: Record<string, string> = {
      create_project: '创建项目',
      update_project: '更新项目',
      delete_project: '删除项目',
      create_task: '创建任务',
      update_task: '更新任务',
      delete_task: '删除任务',
      create_user: '创建用户',
      update_user: '更新用户',
      delete_user: '停用用户',
      create_expense: '创建支出',
      update_expense: '更新支出',
      delete_expense: '删除支出',
      login: '登录',
      logout: '登出',
    }
    return actionMap[actionType] || actionType
  }

  const getResourceTypeDisplay = (resourceType: string) => {
    const resourceMap: Record<string, string> = {
      project: '项目',
      task: '任务',
      user: '用户',
      expense: '支出',
      auth: '认证',
    }
    return resourceMap[resourceType] || resourceType
  }

  const currentPage = Math.floor((filters.skip || 0) / (filters.limit || 50)) + 1
  const totalPages = Math.ceil(total / (filters.limit || 50))
  const hasActiveFilters = !!(filters.action_type || filters.resource_type || filters.start_date || filters.end_date)

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">操作审计日志</h1>
        <p className="text-gray-600">查看系统中所有用户的操作记录</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="action_type" className="block text-sm font-medium mb-1">
              操作类型
            </label>
            <select
              id="action_type"
              value={filters.action_type || ''}
              onChange={(e) => handleFilterChange('action_type', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="create_project">创建项目</option>
              <option value="update_project">更新项目</option>
              <option value="delete_project">删除项目</option>
              <option value="create_task">创建任务</option>
              <option value="update_task">更新任务</option>
              <option value="delete_task">删除任务</option>
              <option value="create_user">创建用户</option>
              <option value="update_user">更新用户</option>
              <option value="delete_user">停用用户</option>
            </select>
          </div>

          <div>
            <label htmlFor="resource_type" className="block text-sm font-medium mb-1">
              资源类型
            </label>
            <select
              id="resource_type"
              value={filters.resource_type || ''}
              onChange={(e) => handleFilterChange('resource_type', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="project">项目</option>
              <option value="task">任务</option>
              <option value="user">用户</option>
              <option value="expense">支出</option>
            </select>
          </div>

          <div>
            <label htmlFor="start_date" className="block text-sm font-medium mb-1">
              开始日期
            </label>
            <input
              id="start_date"
              type="datetime-local"
              value={filters.start_date || ''}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium mb-1">
              结束日期
            </label>
            <input
              id="end_date"
              type="datetime-local"
              value={filters.end_date || ''}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              清除筛选
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  资源类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  资源名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP 地址
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      {getActionTypeDisplay(log.action_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getResourceTypeDisplay(log.resource_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.resource_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip_address || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {hasActiveFilters ? '没有符合筛选条件的审计日志' : '暂无审计日志'}
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              显示 {(filters.skip || 0) + 1} - {Math.min((filters.skip || 0) + (filters.limit || 50), total)} 条，共 {total} 条
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={!filters.skip || filters.skip === 0}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <div className="px-4 py-2 text-sm text-gray-700">
                第 {currentPage} / {totalPages} 页
              </div>
              <button
                onClick={handleNextPage}
                disabled={(filters.skip || 0) + (filters.limit || 50) >= total}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

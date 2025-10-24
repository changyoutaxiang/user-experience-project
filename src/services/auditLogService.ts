/**
 * Audit Log API service client.
 */
import { api } from './api'
import { AuditLogListResponse, AuditLogFilters } from '@/types/auditLog'

export const auditLogService = {
  /**
   * List audit logs with optional filtering
   */
  async listAuditLogs(filters?: AuditLogFilters): Promise<AuditLogListResponse> {
    const response = await api.get<AuditLogListResponse>('/api/v1/audit-logs', {
      params: filters
    })
    return response.data
  },
}

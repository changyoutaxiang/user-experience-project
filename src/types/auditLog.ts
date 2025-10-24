/**
 * Audit log related TypeScript types.
 */

export interface AuditLog {
  id: string
  user_id: string | null
  action_type: string
  resource_type: string
  resource_id: string | null
  resource_name: string | null
  details: Record<string, any> | null
  timestamp: string
  ip_address: string | null
}

export interface AuditLogListResponse {
  total: number
  items: AuditLog[]
}

export interface AuditLogFilters {
  user_id?: string
  action_type?: string
  resource_type?: string
  resource_id?: string
  start_date?: string
  end_date?: string
  skip?: number
  limit?: number
}

/**
 * Dashboard and general API-related TypeScript types.
 */

export interface ProjectStatusCount {
  planning: number
  in_progress: number
  completed: number
  archived: number
}

export interface DashboardStats {
  total_projects: number
  projects_by_status: ProjectStatusCount
  total_budget: number
  total_spent: number
  budget_usage_rate: number
  overdue_projects: number
  overdue_tasks: number
  total_tasks: number
  my_pending_tasks: number
}

export interface ProjectSummary {
  id: string
  name: string
  status: string
  budget_usage_rate: number
  is_overdue: boolean
  is_over_budget: boolean
}

/**
 * Task-related TypeScript types.
 */
import { User } from './user'

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Task {
  id: string
  name: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  project_id: string
  assignee_id: string | null
  assignee: User | null
  assignee_name?: string | null  // 后端返回的计算字段
  created_by_id: string | null
  due_date: string | null
  is_overdue: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface TaskWithProject extends Task {
  project_name: string
  project_status: string
}

// Request types for creating/updating

export interface TaskCreateRequest {
  name: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  project_id: string
  assignee_id?: string | null
  due_date?: string | null
}

export interface TaskUpdateRequest {
  name?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  assignee_id?: string | null
  due_date?: string | null
}

// Statistics types

export interface TaskStats {
  total: number
  todo: number
  in_progress: number
  in_review: number
  completed: number
  cancelled: number
  overdue: number
}

export interface MyTasksSummary {
  pending_tasks: number
  overdue_tasks: number
  completed_this_week: number
  tasks_by_priority: Record<string, number>
}

/**
 * Task API service client.
 */
import { api } from './api'
import {
  Task,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskStats,
  MyTasksSummary,
  TaskStatus,
  TaskPriority,
} from '@/types/task'

export const taskService = {
  /**
   * Create a new task
   */
  async createTask(data: TaskCreateRequest): Promise<Task> {
    const response = await api.post<Task>('/api/v1/tasks', data)
    return response.data
  },

  /**
   * List all tasks with optional filters
   */
  async listTasks(params?: {
    project_id?: string
    assignee_id?: string
    status?: TaskStatus
    priority?: TaskPriority
    is_overdue?: boolean
    skip?: number
    limit?: number
  }): Promise<Task[]> {
    const response = await api.get<Task[]>('/api/v1/tasks', { params })
    return response.data
  },

  /**
   * Get tasks assigned to current user
   */
  async getMyTasks(params?: {
    status?: TaskStatus
    is_overdue?: boolean
  }): Promise<Task[]> {
    const response = await api.get<Task[]>('/api/v1/tasks/my-tasks', { params })
    return response.data
  },

  /**
   * Get summary of current user's tasks
   */
  async getMyTasksSummary(): Promise<MyTasksSummary> {
    const response = await api.get<MyTasksSummary>('/api/v1/tasks/my-tasks/summary')
    return response.data
  },

  /**
   * Get a task by ID
   */
  async getTask(taskId: string): Promise<Task> {
    const response = await api.get<Task>(`/api/v1/tasks/${taskId}`)
    return response.data
  },

  /**
   * Update a task
   */
  async updateTask(taskId: string, data: TaskUpdateRequest): Promise<Task> {
    const response = await api.patch<Task>(`/api/v1/tasks/${taskId}`, data)
    return response.data
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/api/v1/tasks/${taskId}`)
  },

  /**
   * Get task statistics for a project
   */
  async getProjectTaskStats(projectId: string): Promise<TaskStats> {
    const response = await api.get<TaskStats>(`/api/v1/tasks/projects/${projectId}/stats`)
    return response.data
  },
}

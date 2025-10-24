/**
 * Custom hook for managing tasks.
 */
import { useState, useEffect } from 'react'
import { taskService } from '@/services/taskService'
import { Task, TaskStatus, TaskPriority, TaskCreateRequest, TaskUpdateRequest } from '@/types/task'

interface UseTasksOptions {
  project_id?: string
  assignee_id?: string
  status?: TaskStatus
  priority?: TaskPriority
  is_overdue?: boolean
  autoFetch?: boolean
}

export const useTasks = (options: UseTasksOptions = {}) => {
  const { project_id, assignee_id, status, priority, is_overdue, autoFetch = true } = options

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await taskService.listTasks({
        project_id,
        assignee_id,
        status,
        priority,
        is_overdue,
      })
      setTasks(data)
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to load tasks'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (data: TaskCreateRequest) => {
    try {
      const newTask = await taskService.createTask(data)
      setTasks((prev) => [newTask, ...prev])
      return { success: true, data: newTask }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to create task'
      return { success: false, error: message }
    }
  }

  const updateTask = async (taskId: string, data: TaskUpdateRequest) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, data)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
      return { success: true, data: updatedTask }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to update task'
      return { success: false, error: message }
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      return { success: true }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to delete task'
      return { success: false, error: message }
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchTasks()
    }
  }, [project_id, assignee_id, status, priority, is_overdue, autoFetch])

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
}

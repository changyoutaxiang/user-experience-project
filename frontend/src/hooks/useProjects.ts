/**
 * Custom hook for managing projects list.
 */
import { useState, useEffect } from 'react'
import { projectService } from '@/services/projectService'
import { Project, ProjectStatus } from '@/types/project'

interface UseProjectsOptions {
  status?: ProjectStatus
  owner_id?: string
  autoFetch?: boolean
}

export const useProjects = (options: UseProjectsOptions = {}) => {
  const { status, owner_id, autoFetch = true } = options

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await projectService.listProjects({ status, owner_id })
      setProjects(data)
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to load projects'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (data: any) => {
    try {
      const newProject = await projectService.createProject(data)
      setProjects((prev) => [newProject, ...prev])
      return { success: true, data: newProject }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to create project'
      return { success: false, error: message }
    }
  }

  const updateProject = async (projectId: string, data: any) => {
    try {
      const updatedProject = await projectService.updateProject(projectId, data)
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updatedProject : p)))
      return { success: true, data: updatedProject }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to update project'
      return { success: false, error: message }
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      return { success: true }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to delete project'
      return { success: false, error: message }
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchProjects()
    }
  }, [status, owner_id, autoFetch])

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}

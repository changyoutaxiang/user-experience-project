/**
 * Custom hook for managing individual project details.
 */
import { useState, useEffect } from 'react'
import { projectService } from '@/services/projectService'
import { ProjectDetail, ProjectMemberAddRequest, DocumentLinkCreateRequest } from '@/types/project'

export const useProjectDetail = (projectId: string | undefined) => {
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = async () => {
    if (!projectId) return

    try {
      setLoading(true)
      setError(null)
      const data = await projectService.getProject(projectId)
      setProject(data)
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to load project details'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const updateProject = async (data: any) => {
    if (!projectId) return { success: false, error: 'No project ID' }

    try {
      const updatedProject = await projectService.updateProject(projectId, data)
      setProject((prev) => (prev ? { ...prev, ...updatedProject } : null))
      return { success: true, data: updatedProject }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to update project'
      return { success: false, error: message }
    }
  }

  // Member management
  const addMember = async (data: ProjectMemberAddRequest) => {
    if (!projectId) return { success: false, error: 'No project ID' }

    try {
      const newMember = await projectService.addMember(projectId, data)
      setProject((prev) => {
        if (!prev) return null
        return {
          ...prev,
          members: [...prev.members, newMember],
        }
      })
      return { success: true, data: newMember }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to add member'
      return { success: false, error: message }
    }
  }

  const removeMember = async (userId: string) => {
    if (!projectId) return { success: false, error: 'No project ID' }

    try {
      await projectService.removeMember(projectId, userId)
      setProject((prev) => {
        if (!prev) return null
        return {
          ...prev,
          members: prev.members.filter((m) => m.user_id !== userId),
        }
      })
      return { success: true }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to remove member'
      return { success: false, error: message }
    }
  }

  // Document link management
  const addDocumentLink = async (data: DocumentLinkCreateRequest) => {
    if (!projectId) return { success: false, error: 'No project ID' }

    try {
      const newLink = await projectService.addDocumentLink(projectId, data)
      setProject((prev) => {
        if (!prev) return null
        return {
          ...prev,
          document_links: [...prev.document_links, newLink],
        }
      })
      return { success: true, data: newLink }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to add document link'
      return { success: false, error: message }
    }
  }

  const deleteDocumentLink = async (linkId: string) => {
    try {
      await projectService.deleteDocumentLink(linkId)
      setProject((prev) => {
        if (!prev) return null
        return {
          ...prev,
          document_links: prev.document_links.filter((link) => link.id !== linkId),
        }
      })
      return { success: true }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to delete document link'
      return { success: false, error: message }
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  return {
    project,
    loading,
    error,
    refetch: fetchProject,
    updateProject,
    addMember,
    removeMember,
    addDocumentLink,
    deleteDocumentLink,
  }
}

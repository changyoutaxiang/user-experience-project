/**
 * Project API service client.
 */
import { api } from './api'
import {
  Project,
  ProjectDetail,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectMember,
  ProjectMemberAddRequest,
  DocumentLink,
  DocumentLinkCreateRequest,
  DocumentLinkUpdateRequest,
  ProjectStatus,
} from '@/types/project'

export const projectService = {
  /**
   * List all projects with optional filters
   */
  async listProjects(params?: {
    status?: ProjectStatus
    owner_id?: string
    skip?: number
    limit?: number
  }): Promise<Project[]> {
    const response = await api.get<Project[]>('/api/v1/projects', { params })
    return response.data
  },

  /**
   * Get overdue projects
   */
  async getOverdueProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/api/v1/projects/overdue')
    return response.data
  },

  /**
   * Get a project by ID with full details
   */
  async getProject(projectId: string): Promise<ProjectDetail> {
    const response = await api.get<ProjectDetail>(`/api/v1/projects/${projectId}`)
    return response.data
  },

  /**
   * Create a new project
   */
  async createProject(data: ProjectCreateRequest): Promise<Project> {
    const response = await api.post<Project>('/api/v1/projects', data)
    return response.data
  },

  /**
   * Update a project
   */
  async updateProject(projectId: string, data: ProjectUpdateRequest): Promise<Project> {
    const response = await api.patch<Project>(`/api/v1/projects/${projectId}`, data)
    return response.data
  },

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/api/v1/projects/${projectId}`)
  },

  // ========== Member Management ==========

  /**
   * Add a member to a project
   */
  async addMember(projectId: string, data: ProjectMemberAddRequest): Promise<ProjectMember> {
    const response = await api.post<ProjectMember>(`/api/v1/projects/${projectId}/members`, data)
    return response.data
  },

  /**
   * List all members of a project
   */
  async listMembers(projectId: string): Promise<ProjectMember[]> {
    const response = await api.get<ProjectMember[]>(`/api/v1/projects/${projectId}/members`)
    return response.data
  },

  /**
   * Remove a member from a project
   */
  async removeMember(projectId: string, userId: string): Promise<void> {
    await api.delete(`/api/v1/projects/${projectId}/members/${userId}`)
  },

  // ========== Document Link Management ==========

  /**
   * Add a document link to a project
   */
  async addDocumentLink(
    projectId: string,
    data: DocumentLinkCreateRequest
  ): Promise<DocumentLink> {
    const response = await api.post<DocumentLink>(
      `/api/v1/projects/${projectId}/documents`,
      data
    )
    return response.data
  },

  /**
   * List all document links for a project
   */
  async listDocumentLinks(projectId: string): Promise<DocumentLink[]> {
    const response = await api.get<DocumentLink[]>(`/api/v1/projects/${projectId}/documents`)
    return response.data
  },

  /**
   * Update a document link
   */
  async updateDocumentLink(
    linkId: string,
    data: DocumentLinkUpdateRequest
  ): Promise<DocumentLink> {
    const response = await api.patch<DocumentLink>(`/api/v1/projects/documents/${linkId}`, data)
    return response.data
  },

  /**
   * Delete a document link
   */
  async deleteDocumentLink(linkId: string): Promise<void> {
    await api.delete(`/api/v1/projects/documents/${linkId}`)
  },
}

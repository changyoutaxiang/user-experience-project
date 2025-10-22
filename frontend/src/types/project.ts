/**
 * Project-related TypeScript types.
 */
import { User } from './user'

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  budget: number
  spent: number
  owner_id: string
  owner: User
  created_at: string
  updated_at: string
}

export interface ProjectDetail extends Project {
  members: ProjectMember[]
  document_links: DocumentLink[]
}

export interface ProjectListItem {
  id: string
  name: string
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  budget: number
  spent: number
  owner_id: string
  owner_name: string
  member_count: number
  task_count: number
  created_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  user: User
  role: string | null
  assigned_at: string
}

export interface DocumentLink {
  id: string
  project_id: string
  title: string
  url: string
  description: string | null
  created_by_id: string | null
  created_at: string
  updated_at: string
}

// Request types for creating/updating

export interface ProjectCreateRequest {
  name: string
  description?: string | null
  status?: ProjectStatus
  start_date?: string | null
  end_date?: string | null
  budget?: number
  owner_id?: string
}

export interface ProjectUpdateRequest {
  name?: string
  description?: string | null
  status?: ProjectStatus
  start_date?: string | null
  end_date?: string | null
  budget?: number
  spent?: number
}

export interface ProjectMemberAddRequest {
  user_id: string
  role?: string | null
}

export interface DocumentLinkCreateRequest {
  title: string
  url: string
  description?: string | null
}

export interface DocumentLinkUpdateRequest {
  title?: string
  description?: string | null
}

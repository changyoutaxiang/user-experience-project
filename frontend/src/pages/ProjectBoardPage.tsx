/**
 * ProjectBoardPage - Main page for viewing and managing projects.
 */
import { useState } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { ProjectList } from '@/components/projects/ProjectList'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { ProjectStatus, Project } from '@/types/project'

export const ProjectBoardPage = () => {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | undefined>(undefined)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { projects, loading, error, refetch, createProject, deleteProject } = useProjects({
    status: statusFilter,
  })

  const handleCreateProject = async (data: any) => {
    const result = await createProject(data)
    if (result.success) {
      setIsCreateModalOpen(false)
    }
    return result
  }

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`确定要删除项目 "${project.name}" 吗？此操作不可撤销。`)) {
      return
    }

    const result = await deleteProject(project.id)
    if (result.success) {
      // Project already removed from list by hook
    } else {
      alert(`删除失败: ${result.error}`)
    }
  }

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (error && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-destructive">{error}</div>
        <Button onClick={refetch}>重试</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">项目看板</h1>
          <p className="text-muted-foreground mt-1">管理所有项目</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>创建项目</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
        <label htmlFor="status-filter" className="text-sm font-medium">
          筛选状态:
        </label>
        <Select
          id="status-filter"
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | undefined)}
          className="w-48"
        >
          <option value="">全部状态</option>
          <option value={ProjectStatus.PLANNING}>计划中</option>
          <option value={ProjectStatus.IN_PROGRESS}>进行中</option>
          <option value={ProjectStatus.COMPLETED}>已完成</option>
          <option value={ProjectStatus.ARCHIVED}>已归档</option>
        </Select>

        <div className="flex-1" />

        <div className="text-sm text-muted-foreground">
          共 {projects.length} 个项目
        </div>
      </div>

      {/* Project List */}
      <ProjectList
        projects={projects}
        onDelete={handleDeleteProject}
        emptyMessage={
          statusFilter
            ? `暂无 "${statusFilter === ProjectStatus.PLANNING ? '计划中' : statusFilter === ProjectStatus.IN_PROGRESS ? '进行中' : statusFilter === ProjectStatus.COMPLETED ? '已完成' : '已归档'}" 状态的项目`
            : '暂无项目，点击上方"创建项目"按钮开始'
        }
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  )
}

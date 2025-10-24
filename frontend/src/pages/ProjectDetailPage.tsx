/**
 * ProjectDetailPage - Display detailed information about a project.
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projectService } from '@/services/projectService'
import { taskService } from '@/services/taskService'
import { ProjectDetail, DocumentLink } from '@/types/project'
import { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types/task'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'
import { ProjectMemberPicker } from '@/components/projects/ProjectMemberPicker'
import { DocumentLinkList } from '@/components/documents/DocumentLinkList'
import { DocumentLinkForm } from '@/components/documents/DocumentLinkForm'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskForm } from '@/components/tasks/TaskForm'

export const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  const fetchProjectData = async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      const [projectData, tasksData] = await Promise.all([
        projectService.getProject(projectId),
        taskService.listTasks({ project_id: projectId }),
      ])
      setProject(projectData)
      setTasks(tasksData)
    } catch (err: any) {
      console.error('Failed to fetch project data:', err)
      setError('加载项目详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDocument = async (data: any) => {
    if (!projectId) return { success: false, error: 'Project ID not found' }

    try {
      await projectService.addDocumentLink(projectId, data)
      await fetchProjectData()
      setShowAddDocumentModal(false)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || '添加文档失败' }
    }
  }

  const handleDeleteDocument = async (document: DocumentLink) => {
    if (!confirm('确定要删除这个文档链接吗？')) return

    try {
      await projectService.deleteDocumentLink(document.id)
      await fetchProjectData()
    } catch (err: any) {
      alert(err.response?.data?.detail || '删除文档失败')
    }
  }

  const handleCreateTask = async (data: TaskCreateRequest | TaskUpdateRequest) => {
    if (!projectId) return { success: false, error: 'Project ID not found' }

    try {
      // 确保data包含project_id（创建时需要）
      const createData = { ...data, project_id: projectId } as TaskCreateRequest
      await taskService.createTask(createData)
      await fetchProjectData()
      setShowAddTaskModal(false)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || '创建任务失败' }
    }
  }

  const handleEditTask = async (data: any) => {
    if (!editingTask) return { success: false, error: 'No task selected' }

    try {
      await taskService.updateTask(editingTask.id, data)
      await fetchProjectData()
      setEditingTask(null)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || '更新任务失败' }
    }
  }

  const handleDeleteTask = async (task: Task) => {
    if (!confirm('确定要删除这个任务吗？')) return

    try {
      await taskService.deleteTask(task.id)
      await fetchProjectData()
    } catch (err: any) {
      alert(err.response?.data?.detail || '删除任务失败')
    }
  }

  const handleDeleteProject = async () => {
    if (!project || !projectId) return

    if (!confirm(`确定要删除项目 "${project.name}" 吗？此操作不可撤销！`)) return

    try {
      await projectService.deleteProject(projectId)
      navigate('/projects')
    } catch (err: any) {
      alert(err.response?.data?.detail || '删除项目失败')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未设置'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN')
  }

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error || '项目未找到'}</div>
      </div>
    )
  }

  const budgetUsagePercent = project.budget > 0 ? (project.spent / project.budget) * 100 : 0

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/projects')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 返回
            </button>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <button
            onClick={handleDeleteProject}
            className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
          >
            删除项目
          </button>
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">负责人</p>
            <p className="font-medium">{project.owner.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">项目周期</p>
            <p className="font-medium">
              {formatDate(project.start_date)} - {formatDate(project.end_date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">预算使用</p>
            <p className="font-medium">
              {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
              <span className={`ml-2 text-sm ${budgetUsagePercent > 100 ? 'text-red-600' : 'text-gray-500'}`}>
                ({budgetUsagePercent.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>

        {project.description && (
          <div className="mt-4 p-4 bg-white border rounded-lg">
            <p className="text-sm text-gray-500 mb-1">项目描述</p>
            <p className="text-gray-700">{project.description}</p>
          </div>
        )}
      </div>

      {/* Main Content - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Members */}
        <div className="bg-white border rounded-lg p-6">
          <ProjectMemberPicker
            projectId={projectId!}
            members={project.members}
            onMembersChange={fetchProjectData}
          />
        </div>

        {/* Middle Column: Tasks */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">项目任务</h3>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + 新建任务
            </button>
          </div>

          <TaskList
            tasks={tasks}
            onEditTask={setEditingTask}
            onDeleteTask={handleDeleteTask}
            emptyMessage="暂无任务，点击上方按钮创建任务"
          />
        </div>

        {/* Right Column: Documents */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">文档链接</h3>
            <button
              onClick={() => setShowAddDocumentModal(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + 添加文档
            </button>
          </div>

          <DocumentLinkList
            documents={project.document_links}
            onDelete={handleDeleteDocument}
            emptyMessage="暂无文档链接"
          />
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddDocumentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddDocumentModal(false)} />
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">添加文档链接</h2>
            <DocumentLinkForm
              onSubmit={handleAddDocument}
              onCancel={() => setShowAddDocumentModal(false)}
              submitLabel="添加"
            />
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddTaskModal(false)} />
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">创建新任务</h2>
            <TaskForm
              projectMembers={project.members}
              onSubmit={handleCreateTask}
              onCancel={() => setShowAddTaskModal(false)}
              submitLabel="创建"
            />
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditingTask(null)} />
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">编辑任务</h2>
            <TaskForm
              task={editingTask}
              projectMembers={project.members}
              onSubmit={handleEditTask}
              onCancel={() => setEditingTask(null)}
              submitLabel="保存"
            />
          </div>
        </div>
      )}
    </div>
  )
}

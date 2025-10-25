/**
 * TaskForm component for creating and editing tasks.
 */
import { useState, useEffect } from 'react'
import { Task, TaskStatus, TaskPriority, TaskCreateRequest, TaskUpdateRequest } from '@/types/task'
import { ProjectMember } from '@/types/project'

interface TaskFormProps {
  task?: Task
  projectMembers: ProjectMember[]
  onSubmit: (data: TaskCreateRequest | TaskUpdateRequest) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  submitLabel?: string
}

export const TaskForm = ({ task, projectMembers, onSubmit, onCancel, submitLabel = '创建任务' }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    name: task?.name || '',
    description: task?.description || '',
    status: task?.status || TaskStatus.TODO,
    priority: task?.priority || TaskPriority.MEDIUM,
    assignee_id: task?.assignee_id || '',
    due_date: task?.due_date || '',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignee_id: task.assignee_id || '',
        due_date: task.due_date || '',
      })
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Validation
    if (!formData.name.trim()) {
      setError('任务名称不能为空')
      setSubmitting(false)
      return
    }

    try {
      const submitData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        assignee_id: formData.assignee_id || null,
        due_date: formData.due_date || null,
      }

      const result = await onSubmit(submitData)

      if (!result.success) {
        setError(result.error || '提交失败')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || '提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Task Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          任务名称 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="输入任务名称"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          任务描述
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="输入任务描述（可选）"
          rows={3}
        />
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            状态
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={TaskStatus.TODO}>待处理</option>
            <option value={TaskStatus.IN_PROGRESS}>进行中</option>
            <option value={TaskStatus.IN_REVIEW}>审核中</option>
            <option value={TaskStatus.COMPLETED}>已完成</option>
            <option value={TaskStatus.CANCELLED}>已取消</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium mb-1">
            优先级
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={TaskPriority.LOW}>低</option>
            <option value={TaskPriority.MEDIUM}>中</option>
            <option value={TaskPriority.HIGH}>高</option>
            <option value={TaskPriority.URGENT}>紧急</option>
          </select>
        </div>
      </div>

      {/* Assignee */}
      <div>
        <label htmlFor="assignee" className="block text-sm font-medium mb-1">
          负责人
        </label>
        <select
          id="assignee"
          value={formData.assignee_id}
          onChange={(e) => handleChange('assignee_id', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">未分配</option>
          {projectMembers.map(member => (
            <option key={member.user_id} value={member.user_id}>
              {member.user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="due_date" className="block text-sm font-medium mb-1">
          截止日期
        </label>
        <input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) => handleChange('due_date', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          disabled={submitting}
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? '提交中...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

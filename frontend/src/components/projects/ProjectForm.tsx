/**
 * ProjectForm component for creating and editing projects.
 */
import { useState, FormEvent } from 'react'
import { Project, ProjectStatus, ProjectCreateRequest } from '@/types/project'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'

interface ProjectFormProps {
  project?: Project | null
  onSubmit: (data: ProjectCreateRequest) => Promise<any>
  onCancel?: () => void
  submitLabel?: string
}

export const ProjectForm = ({
  project,
  onSubmit,
  onCancel,
  submitLabel = '创建项目',
}: ProjectFormProps) => {
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [status, setStatus] = useState<ProjectStatus>(project?.status || ProjectStatus.PLANNING)
  const [startDate, setStartDate] = useState(project?.start_date || '')
  const [endDate, setEndDate] = useState(project?.end_date || '')
  const [budget, setBudget] = useState(project?.budget?.toString() || '0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!name.trim()) {
      setError('项目名称不能为空')
      return
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError('结束日期必须晚于开始日期')
      return
    }

    const budgetNum = parseFloat(budget)
    if (isNaN(budgetNum) || budgetNum < 0) {
      setError('预算必须是非负数')
      return
    }

    try {
      setLoading(true)

      const data: ProjectCreateRequest = {
        name: name.trim(),
        description: description.trim() || null,
        status,
        start_date: startDate || null,
        end_date: endDate || null,
        budget: budgetNum,
      }

      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || '提交失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          项目名称 <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入项目名称"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          项目描述
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="输入项目描述（可选）"
          rows={3}
          className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-1">
          项目状态
        </label>
        <Select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
        >
          <option value={ProjectStatus.PLANNING}>计划中</option>
          <option value={ProjectStatus.IN_PROGRESS}>进行中</option>
          <option value={ProjectStatus.COMPLETED}>已完成</option>
          <option value={ProjectStatus.ARCHIVED}>已归档</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium mb-1">
            开始日期
          </label>
          <Input
            id="start_date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium mb-1">
            结束日期
          </label>
          <Input
            id="end_date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-medium mb-1">
          预算（元）
        </label>
        <Input
          id="budget"
          type="number"
          step="0.01"
          min="0"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? '提交中...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            取消
          </Button>
        )}
      </div>
    </form>
  )
}

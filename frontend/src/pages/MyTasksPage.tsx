/**
 * MyTasksPage - Page showing current user's assigned tasks.
 */
import { useState, useEffect } from 'react'
import { taskService } from '@/services/taskService'
import { Task, TaskStatus, MyTasksSummary } from '@/types/task'
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'
import { TaskPriorityBadge } from '@/components/tasks/TaskPriorityBadge'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'

export const MyTasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [summary, setSummary] = useState<MyTasksSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [tasksData, summaryData] = await Promise.all([
          taskService.getMyTasks({ status: statusFilter || undefined }),
          taskService.getMyTasksSummary(),
        ])
        setTasks(tasksData)
        setSummary(summaryData)
      } catch (error) {
        console.error('Failed to load tasks:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [statusFilter])

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">我的任务</h1>
        <p className="text-muted-foreground mt-1">管理分配给我的任务</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">待办任务</p>
            <p className="text-2xl font-bold mt-1">{summary.pending_tasks}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">逾期任务</p>
            <p className="text-2xl font-bold mt-1 text-destructive">{summary.overdue_tasks}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">本周完成</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{summary.completed_this_week}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">紧急任务</p>
            <p className="text-2xl font-bold mt-1 text-orange-600">
              {summary.tasks_by_priority.urgent || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
        <label htmlFor="status-filter" className="text-sm font-medium">
          筛选状态:
        </label>
        <Select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
          className="w-48"
        >
          <option value="">全部状态</option>
          <option value={TaskStatus.TODO}>待处理</option>
          <option value={TaskStatus.IN_PROGRESS}>进行中</option>
          <option value={TaskStatus.IN_REVIEW}>审核中</option>
          <option value={TaskStatus.COMPLETED}>已完成</option>
        </Select>
        <div className="flex-1" />
        <div className="text-sm text-muted-foreground">共 {tasks.length} 个任务</div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">暂无任务</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-card p-4 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{task.name}</h3>
                    <TaskStatusBadge status={task.status} />
                    <TaskPriorityBadge priority={task.priority} />
                    {task.is_overdue && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        已逾期
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  )}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {task.due_date && (
                      <span>
                        截止日期: {new Date(task.due_date).toLocaleDateString('zh-CN')}
                      </span>
                    )}
                    <span>创建于: {new Date(task.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

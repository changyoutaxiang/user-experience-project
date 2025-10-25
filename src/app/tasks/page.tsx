'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Task {
  id: string
  name: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string | null
  project: {
    id: string
    name: string
  }
  assignee: {
    id: string
    name: string
    email: string
  } | null
  createdBy: {
    id: string
    name: string
  }
}

const statusLabels = {
  TODO: '待办',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
}

const priorityLabels = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  URGENT: '紧急'
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
}

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default function TasksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchTasks()
    }
  }, [status, router])

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        fetchTasks() // 重新获取任务列表
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('确定要删除这个任务吗？')) return

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchTasks() // 重新获取任务列表
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const filteredTasks = statusFilter === 'all'
    ? tasks
    : tasks.filter(task => task.status === statusFilter)

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">任务管理</h1>
            <p className="text-gray-600">管理和跟踪所有任务</p>
          </div>
          <button
            onClick={() => router.push('/tasks/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            创建任务
          </button>
        </div>

        {/* 状态过滤器 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            全部 ({tasks.length})
          </button>
          {Object.entries(statusLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded ${
                statusFilter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label} ({tasks.filter(t => t.status === key).length})
            </button>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">
              {statusFilter === 'all' ? '还没有任务' : `没有${statusLabels[statusFilter as keyof typeof statusLabels]}任务`}
            </p>
            {statusFilter === 'all' && (
              <button
                onClick={() => router.push('/tasks/new')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                创建第一个任务
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{task.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {task.description || '暂无描述'}
                    </p>
                    <div className="flex gap-2 items-center text-sm text-gray-500">
                      <span>项目: {task.project.name}</span>
                      <span>•</span>
                      <span>负责人: {task.assignee?.name || '未分配'}</span>
                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <span>截止: {new Date(task.dueDate).toLocaleDateString('zh-CN')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs ${statusColors[task.status]}`}>
                      {statusLabels[task.status]}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                    <>
                      {task.status === 'TODO' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          开始
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          完成
                        </button>
                      )}
                      <button
                        onClick={() => updateTaskStatus(task.id, 'CANCELLED')}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        取消
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => router.push(`/tasks/${task.id}`)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    查看详情
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

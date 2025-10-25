'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  budget: number
  startDate: string | null
  endDate: string | null
  owner: {
    id: string
    name: string
    email: string
  }
  members: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
  tasks: Array<{
    id: string
    title: string
    status: string
    priority: string
    assignee: {
      id: string
      name: string
    } | null
  }>
  expenses: Array<{
    id: string
    amount: number
    description: string
    expenseDate: string
    user: {
      id: string
      name: string
    }
  }>
  documentLinks: Array<{
    id: string
    title: string
    url: string
    uploadedAt: string
    uploadedBy: {
      id: string
      name: string
    }
  }>
  _count: {
    tasks: number
    members: number
    expenses: number
    documentLinks: number
  }
}

const statusLabels: Record<string, string> = {
  PLANNING: '规划中',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  ON_HOLD: '暂停',
  CANCELLED: '已取消'
}

const taskStatusLabels: Record<string, string> = {
  TODO: '待办',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
}

const priorityLabels: Record<string, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  URGENT: '紧急'
}

export default function ProjectDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'members' | 'expenses' | 'documents'>('overview')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && params.id) {
      fetchProject()
    }
  }, [status, params.id, router])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setProject(data)
      } else if (res.status === 404) {
        alert('项目不存在')
        router.push('/projects')
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>加载中...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>项目不存在</div>
      </div>
    )
  }

  // 计算统计数据
  const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length
  const totalExpenses = project.expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 项目头部 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
              <p className="text-gray-600">{project.description || '暂无描述'}</p>
            </div>
            <span className="inline-block px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800">
              {statusLabels[project.status]}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500">项目负责人</p>
              <p className="font-medium">{project.owner.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">预算</p>
              <p className="font-medium">¥{project.budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">开始日期</p>
              <p className="font-medium">
                {project.startDate ? new Date(project.startDate).toLocaleDateString('zh-CN') : '未设置'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">结束日期</p>
              <p className="font-medium">
                {project.endDate ? new Date(project.endDate).toLocaleDateString('zh-CN') : '未设置'}
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">任务数</h3>
            <p className="text-3xl font-bold mt-2">{project._count.tasks}</p>
            <p className="text-sm text-gray-500 mt-1">已完成 {completedTasks}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">团队成员</h3>
            <p className="text-3xl font-bold mt-2">{project._count.members}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">总支出</h3>
            <p className="text-3xl font-bold mt-2">¥{totalExpenses.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">预算 ¥{project.budget.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">文档</h3>
            <p className="text-3xl font-bold mt-2">{project._count.documentLinks}</p>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex">
              {[
                { key: 'overview', label: '概览' },
                { key: 'tasks', label: `任务 (${project._count.tasks})` },
                { key: 'members', label: `成员 (${project._count.members})` },
                { key: 'expenses', label: `支出 (${project._count.expenses})` },
                { key: 'documents', label: `文档 (${project._count.documentLinks})` }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 font-medium ${
                    activeTab === tab.key
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 概览标签页 */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-3">最近任务</h3>
                  {project.tasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500">
                          负责人: {task.assignee?.name || '未分配'}
                        </p>
                      </div>
                      <span className="text-sm px-3 py-1 rounded-full bg-gray-100">
                        {taskStatusLabels[task.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 任务标签页 */}
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                {project.tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无任务</p>
                ) : (
                  project.tasks.map(task => (
                    <div key={task.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500">
                          负责人: {task.assignee?.name || '未分配'} • 优先级: {priorityLabels[task.priority]}
                        </p>
                      </div>
                      <span className="text-sm px-3 py-1 rounded-full bg-gray-100">
                        {taskStatusLabels[task.status]}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 成员标签页 */}
            {activeTab === 'members' && (
              <div className="space-y-3">
                {project.members.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无成员</p>
                ) : (
                  project.members.map(member => (
                    <div key={member.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      </div>
                      <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                        {member.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 支出标签页 */}
            {activeTab === 'expenses' && (
              <div className="space-y-3">
                {project.expenses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无支出记录</p>
                ) : (
                  project.expenses.map(expense => (
                    <div key={expense.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-500">
                          {expense.user.name} • {new Date(expense.expenseDate).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-red-600">
                        ¥{expense.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 文档标签页 */}
            {activeTab === 'documents' && (
              <div className="space-y-3">
                {project.documentLinks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无文档</p>
                ) : (
                  project.documentLinks.map(doc => (
                    <div key={doc.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-gray-500">
                          上传者: {doc.uploadedBy.name} • {new Date(doc.uploadedAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        查看
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-6">
          <button
            onClick={() => router.push('/projects')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← 返回项目列表
          </button>
        </div>
      </div>
    </div>
  )
}

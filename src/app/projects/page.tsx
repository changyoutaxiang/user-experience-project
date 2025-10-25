'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  owner: {
    name: string
  }
  _count: {
    tasks: number
    members: number
  }
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchProjects()
    }
  }, [status, router])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">项目列表</h1>
          <p className="text-gray-600">管理您的所有项目</p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">还没有项目</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              创建第一个项目
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold mb-2">{project.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {project.description || '暂无描述'}
                </p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{project._count.tasks} 个任务</span>
                  <span>{project._count.members} 个成员</span>
                </div>
                <div className="mt-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

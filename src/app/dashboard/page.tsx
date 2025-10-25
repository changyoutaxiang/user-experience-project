import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

async function getDashboardStats(userId: string) {
  const [
    totalProjects,
    totalTasks,
    myPendingTasks,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.task.count(),
    prisma.task.count({
      where: {
        assigneeId: userId,
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    }),
  ])

  return {
    totalProjects,
    totalTasks,
    myPendingTasks,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const stats = await getDashboardStats((session.user as any).id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">仪表板</h1>
          <p className="text-gray-600">欢迎回来，{session.user.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">总项目数</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalProjects}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">总任务数</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalTasks}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">我的待办任务</h3>
            <p className="text-3xl font-bold mt-2">{stats.myPendingTasks}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">快速开始</h2>
          <div className="space-y-2">
            <a href="/projects" className="block text-blue-600 hover:underline">
              查看所有项目 →
            </a>
            <a href="/tasks" className="block text-blue-600 hover:underline">
              查看我的任务 →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Dashboard page component.
 */
import { useDashboard } from '@/hooks/useDashboard'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { BudgetChart } from '@/components/dashboard/BudgetChart'
import { OverdueAlert } from '@/components/dashboard/OverdueAlert'
import { Button } from '@/components/common/Button'
import { Link } from 'react-router-dom'

export const DashboardPage = () => {
  const { stats, loading, error, refetch } = useDashboard()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-destructive">{error}</div>
        <Button onClick={refetch}>重试</Button>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">项目群仪表盘</h1>
          <p className="text-muted-foreground mt-1">用户体验拯救项目群总览</p>
        </div>
        <Link to="/projects">
          <Button>查看所有项目</Button>
        </Link>
      </div>

      {/* Overdue Alert */}
      {(stats.overdue_projects > 0 || stats.overdue_tasks > 0) && (
        <OverdueAlert
          overdueProjects={stats.overdue_projects}
          overdueTasks={stats.overdue_tasks}
        />
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="总项目数" value={stats.total_projects} description="所有项目" />

        <StatsCard
          title="进行中"
          value={stats.projects_by_status.in_progress}
          description="正在执行的项目"
        />

        <StatsCard
          title="已完成"
          value={stats.projects_by_status.completed}
          description="已交付项目"
          trend="up"
        />

        <StatsCard
          title="我的待办任务"
          value={stats.my_pending_tasks}
          description="分配给我的任务"
        />
      </div>

      {/* Project Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">计划中</div>
          <div className="text-2xl font-bold mt-1">{stats.projects_by_status.planning}</div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">进行中</div>
          <div className="text-2xl font-bold mt-1">{stats.projects_by_status.in_progress}</div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">已完成</div>
          <div className="text-2xl font-bold mt-1">{stats.projects_by_status.completed}</div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">已归档</div>
          <div className="text-2xl font-bold mt-1">{stats.projects_by_status.archived}</div>
        </div>
      </div>

      {/* Budget and Tasks Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetChart
          totalBudget={stats.total_budget}
          totalSpent={stats.total_spent}
          budgetUsageRate={stats.budget_usage_rate}
        />

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">任务统计</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">总任务数</span>
              <span className="text-2xl font-bold">{stats.total_tasks}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-muted-foreground">逾期任务</span>
              <span
                className={`text-2xl font-bold ${
                  stats.overdue_tasks > 0 ? 'text-destructive' : 'text-green-600'
                }`}
              >
                {stats.overdue_tasks}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-muted-foreground">我的待办</span>
              <span className="text-2xl font-bold">{stats.my_pending_tasks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State for New Projects */}
      {stats.total_projects === 0 && (
        <div className="bg-muted/50 p-12 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">开始创建项目</h3>
          <p className="text-muted-foreground mb-6">
            您还没有任何项目。点击下方按钮创建第一个项目。
          </p>
          <Link to="/projects">
            <Button>创建项目</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

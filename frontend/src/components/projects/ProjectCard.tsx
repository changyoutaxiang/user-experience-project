/**
 * ProjectCard component for displaying project in a card layout.
 */
import { Link } from 'react-router-dom'
import { Project } from '@/types/project'
import { ProjectStatusBadge } from './ProjectStatusBadge'
import { Button } from '@/components/common/Button'

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
}

export const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  const budgetUsage = project.budget > 0 ? (project.spent / project.budget) * 100 : 0
  const isOverBudget = project.spent > project.budget

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '未设置'
    return new Date(dateStr).toLocaleDateString('zh-CN')
  }

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link to={`/projects/${project.id}`} className="hover:underline">
            <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">负责人: {project.owner.name}</p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Timeline */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">开始日期</p>
          <p className="text-sm font-medium">{formatDate(project.start_date)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">结束日期</p>
          <p className="text-sm font-medium">{formatDate(project.end_date)}</p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">预算使用</span>
          <span className={isOverBudget ? 'text-destructive font-medium' : 'font-medium'}>
            {budgetUsage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${
              isOverBudget ? 'bg-destructive' : budgetUsage > 80 ? 'bg-yellow-500' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(budgetUsage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-muted-foreground">
            已用: {formatCurrency(project.spent)}
          </span>
          <span className="text-muted-foreground">
            总预算: {formatCurrency(project.budget)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Link to={`/projects/${project.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            查看详情
          </Button>
        </Link>
        {onEdit && (
          <Button variant="outline" onClick={() => onEdit(project)}>
            编辑
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" onClick={() => onDelete(project)}>
            删除
          </Button>
        )}
      </div>
    </div>
  )
}

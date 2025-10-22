/**
 * ProjectStatusBadge component for displaying project status.
 */
import { ProjectStatus } from '@/types/project'
import { cn } from '@/lib/utils'

interface ProjectStatusBadgeProps {
  status: ProjectStatus
  className?: string
}

const statusConfig = {
  [ProjectStatus.PLANNING]: {
    label: '计划中',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  [ProjectStatus.IN_PROGRESS]: {
    label: '进行中',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  [ProjectStatus.COMPLETED]: {
    label: '已完成',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  [ProjectStatus.ARCHIVED]: {
    label: '已归档',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
}

export const ProjectStatusBadge = ({ status, className }: ProjectStatusBadgeProps) => {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

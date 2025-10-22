/**
 * TaskStatusBadge component for displaying task status.
 */
import { TaskStatus } from '@/types/task'
import { cn } from '@/lib/utils'

interface TaskStatusBadgeProps {
  status: TaskStatus
  className?: string
}

const statusConfig = {
  [TaskStatus.TODO]: {
    label: '待处理',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: '进行中',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  [TaskStatus.IN_REVIEW]: {
    label: '审核中',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  [TaskStatus.COMPLETED]: {
    label: '已完成',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  [TaskStatus.CANCELLED]: {
    label: '已取消',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}

export const TaskStatusBadge = ({ status, className }: TaskStatusBadgeProps) => {
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

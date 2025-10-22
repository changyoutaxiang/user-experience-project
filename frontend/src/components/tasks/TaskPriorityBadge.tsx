/**
 * TaskPriorityBadge component for displaying task priority.
 */
import { TaskPriority } from '@/types/task'
import { cn } from '@/lib/utils'

interface TaskPriorityBadgeProps {
  priority: TaskPriority
  className?: string
}

const priorityConfig = {
  [TaskPriority.LOW]: {
    label: '低',
    className: 'bg-gray-50 text-gray-600 border-gray-300',
  },
  [TaskPriority.MEDIUM]: {
    label: '中',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  },
  [TaskPriority.HIGH]: {
    label: '高',
    className: 'bg-orange-50 text-orange-700 border-orange-300',
  },
  [TaskPriority.URGENT]: {
    label: '紧急',
    className: 'bg-red-50 text-red-700 border-red-300',
  },
}

export const TaskPriorityBadge = ({ priority, className }: TaskPriorityBadgeProps) => {
  const config = priorityConfig[priority]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

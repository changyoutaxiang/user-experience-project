/**
 * TaskList component for displaying tasks.
 */
import { Task } from '@/types/task'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskPriorityBadge } from './TaskPriorityBadge'

interface TaskListProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
  emptyMessage?: string
}

export const TaskList = ({
  tasks,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  emptyMessage = '暂无任务'
}: TaskListProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未设置'
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN')
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div
          key={task.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Task Name */}
              <div className="flex items-center gap-2 mb-2">
                <h3
                  className={`font-medium ${onTaskClick ? 'cursor-pointer hover:text-blue-600' : ''}`}
                  onClick={() => onTaskClick?.(task)}
                >
                  {task.name}
                </h3>
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
                {task.is_overdue && (
                  <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                    逾期
                  </span>
                )}
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              )}

              {/* Meta Information */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  截止日期: <span className={task.is_overdue ? 'text-red-600 font-medium' : ''}>{formatDate(task.due_date)}</span>
                </span>
                {task.assignee_name && (
                  <span>
                    负责人: <span className="text-gray-700">{task.assignee_name}</span>
                  </span>
                )}
                {task.completed_at && (
                  <span>
                    完成时间: {formatDate(task.completed_at)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {(onEditTask || onDeleteTask) && (
              <div className="flex gap-2 ml-4">
                {onEditTask && (
                  <button
                    onClick={() => onEditTask(task)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    编辑
                  </button>
                )}
                {onDeleteTask && (
                  <button
                    onClick={() => onDeleteTask(task)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    删除
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

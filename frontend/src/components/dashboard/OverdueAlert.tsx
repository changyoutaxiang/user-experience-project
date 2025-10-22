/**
 * OverdueAlert component for displaying overdue warnings.
 */

interface OverdueAlertProps {
  overdueProjects: number
  overdueTasks: number
}

export const OverdueAlert = ({ overdueProjects, overdueTasks }: OverdueAlertProps) => {
  const hasOverdue = overdueProjects > 0 || overdueTasks > 0

  if (!hasOverdue) {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">所有项目和任务都在计划内</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">逾期提醒</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc list-inside space-y-1">
              {overdueProjects > 0 && <li>{overdueProjects} 个项目已逾期</li>}
              {overdueTasks > 0 && <li>{overdueTasks} 个任务已逾期</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

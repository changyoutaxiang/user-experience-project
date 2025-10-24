/**
 * ExpenseList component for displaying project expenses.
 */
import { Expense } from '@/types/expense'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit?: (expense: Expense) => void
  onDelete?: (expense: Expense) => void
  emptyMessage?: string
}

export const ExpenseList = ({
  expenses,
  onEdit,
  onDelete,
  emptyMessage = '暂无支出记录'
}: ExpenseListProps) => {
  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN')
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {expenses.map(expense => (
        <div
          key={expense.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Amount and Description */}
              <div className="flex items-baseline gap-3 mb-2">
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(expense.amount)}
                </p>
                {expense.category && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {expense.category}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-2">{expense.description}</p>

              {/* Meta Information */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>记录日期: {formatDate(expense.recorded_at)}</span>
                <span>创建时间: {formatDate(expense.created_at)}</span>
              </div>
            </div>

            {/* Actions */}
            {(onEdit || onDelete) && (
              <div className="flex gap-2 ml-4">
                {onEdit && (
                  <button
                    onClick={() => onEdit(expense)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    编辑
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(expense)}
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

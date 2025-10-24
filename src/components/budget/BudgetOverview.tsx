/**
 * BudgetOverview component for displaying project budget metrics.
 */
import { BudgetSummary } from '@/types/expense'

interface BudgetOverviewProps {
  summary: BudgetSummary
}

export const BudgetOverview = ({ summary }: BudgetOverviewProps) => {
  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getProgressColor = () => {
    if (summary.is_over_budget) return 'bg-red-600'
    if (summary.usage_percentage > 90) return 'bg-orange-500'
    if (summary.usage_percentage > 75) return 'bg-yellow-500'
    return 'bg-green-600'
  }

  const getStatusText = () => {
    if (summary.is_over_budget) return '预算超支'
    if (summary.usage_percentage > 90) return '预算紧张'
    if (summary.usage_percentage > 75) return '预算正常'
    return '预算充足'
  }

  const getStatusColor = () => {
    if (summary.is_over_budget) return 'text-red-700 bg-red-50 border-red-200'
    if (summary.usage_percentage > 90) return 'text-orange-700 bg-orange-50 border-orange-200'
    if (summary.usage_percentage > 75) return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    return 'text-green-700 bg-green-50 border-green-200'
  }

  return (
    <div className="space-y-4">
      {/* Status Alert */}
      {summary.usage_percentage > 75 && (
        <div className={`p-3 border rounded-md ${getStatusColor()}`}>
          <p className="text-sm font-medium">
            {getStatusText()}
          </p>
          {summary.is_over_budget && (
            <p className="text-xs mt-1">
              已超出预算 {formatCurrency(Math.abs(summary.remaining))}
            </p>
          )}
        </div>
      )}

      {/* Budget Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">总预算</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.budget)}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">已使用</p>
          <p className={`text-2xl font-bold ${summary.is_over_budget ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(summary.spent)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">剩余预算</p>
          <p className={`text-2xl font-bold ${summary.is_over_budget ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(summary.remaining)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">支出记录</p>
          <p className="text-2xl font-bold text-gray-900">{summary.expense_count} 条</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">预算使用率</span>
          <span className={`font-semibold ${summary.is_over_budget ? 'text-red-600' : 'text-gray-900'}`}>
            {summary.usage_percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all ${getProgressColor()}`}
            style={{ width: `${Math.min(summary.usage_percentage, 100)}%` }}
          />
        </div>
        {summary.is_over_budget && (
          <p className="text-xs text-red-600 mt-1">
            超出预算 {(summary.usage_percentage - 100).toFixed(1)}%
          </p>
        )}
      </div>
    </div>
  )
}

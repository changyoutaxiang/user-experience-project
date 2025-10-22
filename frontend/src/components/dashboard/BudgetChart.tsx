/**
 * BudgetChart component for budget visualization.
 */

interface BudgetChartProps {
  totalBudget: number
  totalSpent: number
  budgetUsageRate: number
}

export const BudgetChart = ({ totalBudget, totalSpent, budgetUsageRate }: BudgetChartProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const isOverBudget = totalSpent > totalBudget

  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">预算使用情况</h3>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">已使用</span>
          <span className="font-medium">{budgetUsageRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all ${
              isOverBudget
                ? 'bg-destructive'
                : budgetUsageRate > 80
                ? 'bg-yellow-500'
                : 'bg-primary'
            }`}
            style={{ width: `${Math.min(budgetUsageRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Budget details */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">总预算</span>
          <span className="font-medium">{formatCurrency(totalBudget)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">已花费</span>
          <span className="font-medium">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="flex justify-between pt-3 border-t">
          <span className="text-sm text-muted-foreground">剩余预算</span>
          <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-green-600'}`}>
            {formatCurrency(totalBudget - totalSpent)}
          </span>
        </div>
      </div>

      {isOverBudget && (
        <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
          ⚠️ 预算已超支 {formatCurrency(totalSpent - totalBudget)}
        </div>
      )}
    </div>
  )
}

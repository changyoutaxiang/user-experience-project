/**
 * ExpenseForm component for creating/editing expenses.
 */
import { useState, useEffect } from 'react'
import { Expense, ExpenseCreateRequest, ExpenseUpdateRequest } from '@/types/expense'

interface ExpenseFormProps {
  expense?: Expense
  onSubmit: (data: ExpenseCreateRequest | ExpenseUpdateRequest) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  submitLabel?: string
}

export const ExpenseForm = ({
  expense,
  onSubmit,
  onCancel,
  submitLabel = '添加支出'
}: ExpenseFormProps) => {
  const [formData, setFormData] = useState({
    amount: expense?.amount?.toString() || '',
    description: expense?.description || '',
    category: expense?.category || '',
    recorded_at: expense?.recorded_at ? new Date(expense.recorded_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description,
        category: expense.category || '',
        recorded_at: expense.recorded_at ? new Date(expense.recorded_at).toISOString().split('T')[0] : '',
      })
    }
  }, [expense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Validation
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('金额必须大于 0')
      setSubmitting(false)
      return
    }

    if (!formData.description.trim()) {
      setError('支出描述不能为空')
      setSubmitting(false)
      return
    }

    try {
      const submitData: any = {
        amount: amount,
        description: formData.description.trim(),
        category: formData.category.trim() || null,
        recorded_at: formData.recorded_at || null,
      }

      const result = await onSubmit(submitData)

      if (!result.success) {
        setError(result.error || '提交失败')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || '提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1">
          金额 (元) <span className="text-red-500">*</span>
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          支出描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="输入支出描述"
          rows={3}
          required
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          分类
        </label>
        <input
          id="category"
          type="text"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="例如: 人力、设备、其他 (可选)"
        />
      </div>

      {/* Recorded At */}
      <div>
        <label htmlFor="recorded_at" className="block text-sm font-medium mb-1">
          记录日期
        </label>
        <input
          id="recorded_at"
          type="date"
          value={formData.recorded_at}
          onChange={(e) => handleChange('recorded_at', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          disabled={submitting}
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? '提交中...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

/**
 * Expense-related TypeScript types.
 */

export interface Expense {
  id: string
  project_id: string
  amount: number
  description: string
  category: string | null
  recorded_at: string
  created_by_id: string | null
  created_at: string
  updated_at: string
}

export interface ExpenseCreateRequest {
  amount: number
  description: string
  category?: string | null
  recorded_at?: string | null
}

export interface ExpenseUpdateRequest {
  amount?: number
  description?: string
  category?: string | null
  recorded_at?: string | null
}

export interface BudgetSummary {
  project_id: string
  budget: number
  spent: number
  remaining: number
  usage_percentage: number
  is_over_budget: boolean
  expense_count: number
}

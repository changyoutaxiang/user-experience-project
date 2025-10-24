/**
 * Expense API service client.
 */
import { api } from './api'
import {
  Expense,
  ExpenseCreateRequest,
  ExpenseUpdateRequest,
  BudgetSummary,
} from '@/types/expense'

export const expenseService = {
  /**
   * Create a new expense for a project
   */
  async createExpense(projectId: string, data: ExpenseCreateRequest): Promise<Expense> {
    const response = await api.post<Expense>(`/api/v1/projects/${projectId}/expenses`, data)
    return response.data
  },

  /**
   * List all expenses for a project
   */
  async listExpenses(projectId: string, params?: {
    skip?: number
    limit?: number
  }): Promise<Expense[]> {
    const response = await api.get<Expense[]>(`/api/v1/projects/${projectId}/expenses`, { params })
    return response.data
  },

  /**
   * Get budget summary for a project
   */
  async getBudgetSummary(projectId: string): Promise<BudgetSummary> {
    const response = await api.get<BudgetSummary>(`/api/v1/projects/${projectId}/budget`)
    return response.data
  },

  /**
   * Get a specific expense by ID
   */
  async getExpense(expenseId: string): Promise<Expense> {
    const response = await api.get<Expense>(`/api/v1/expenses/${expenseId}`)
    return response.data
  },

  /**
   * Update an expense
   */
  async updateExpense(expenseId: string, data: ExpenseUpdateRequest): Promise<Expense> {
    const response = await api.patch<Expense>(`/api/v1/expenses/${expenseId}`, data)
    return response.data
  },

  /**
   * Delete an expense
   */
  async deleteExpense(expenseId: string): Promise<void> {
    await api.delete(`/api/v1/expenses/${expenseId}`)
  },
}

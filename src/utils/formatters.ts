/**
 * Formatting utilities for dates, currency, and other data types.
 */

/**
 * Format a date string to Chinese locale date format
 * @param dateString - ISO date string or Date object
 * @param includeTime - Whether to include time in the output
 * @returns Formatted date string (e.g., "2024/01/15" or "2024/01/15 14:30")
 */
export const formatDate = (
  dateString: string | Date,
  includeTime: boolean = false
): string => {
  if (!dateString) return '-'

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString

  if (isNaN(date.getTime())) return '-'

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }

  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }

  return date.toLocaleString('zh-CN', options).replace(/\//g, '/')
}

/**
 * Format a date to relative time (e.g., "2天前", "3小时前")
 * @param dateString - ISO date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string | Date): string => {
  if (!dateString) return '-'

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 30) return `${diffDays}天前`
  if (diffMonths < 12) return `${diffMonths}个月前`
  return `${diffYears}年前`
}

/**
 * Format currency amount in CNY (Chinese Yuan)
 * @param amount - Amount to format (number or string)
 * @param showSymbol - Whether to include ¥ symbol (default: true)
 * @returns Formatted currency string (e.g., "¥1,234.56")
 */
export const formatCurrency = (
  amount: number | string,
  showSymbol: boolean = true
): string => {
  if (amount === null || amount === undefined) return '-'

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) return '-'

  const formatted = numAmount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return showSymbol ? `¥${formatted}` : formatted
}

/**
 * Format a large number with K/M/B suffixes
 * @param num - Number to format
 * @returns Formatted string (e.g., "1.2K", "3.4M")
 */
export const formatCompactNumber = (num: number): string => {
  if (num === null || num === undefined) return '-'
  if (isNaN(num)) return '-'

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Format percentage
 * @param value - Value to format (0-100 or 0-1)
 * @param normalizedToOne - Whether the value is normalized to 1 (default: false, meaning 0-100)
 * @returns Formatted percentage string (e.g., "45.5%")
 */
export const formatPercentage = (
  value: number,
  normalizedToOne: boolean = false
): string => {
  if (value === null || value === undefined) return '-'
  if (isNaN(value)) return '-'

  const percentage = normalizedToOne ? value * 100 : value
  return `${percentage.toFixed(1)}%`
}

/**
 * Format file size in human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  if (!bytes) return '-'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format phone number (Chinese format)
 * @param phone - Phone number string
 * @returns Formatted phone number (e.g., "138 1234 5678")
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '-'

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Format as Chinese mobile number (11 digits)
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`
  }

  return phone
}

/**
 * Format duration in human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration (e.g., "2小时30分")
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds < 0) return '-'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分`)
  if (secs > 0 && hours === 0) parts.push(`${secs}秒`)

  return parts.length > 0 ? parts.join('') : '0秒'
}

/**
 * Check if a date is overdue (past current date)
 * @param dateString - ISO date string
 * @returns True if the date is in the past
 */
export const isOverdue = (dateString: string | Date): boolean => {
  if (!dateString) return false

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()

  // Set time to start of day for fair comparison
  date.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)

  return date < now
}

/**
 * Get days until a date
 * @param dateString - ISO date string
 * @returns Number of days (negative if overdue)
 */
export const getDaysUntil = (dateString: string | Date): number => {
  if (!dateString) return 0

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()

  // Set time to start of day
  date.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)

  const diffMs = date.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

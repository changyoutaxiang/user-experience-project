/**
 * Validation utilities for form inputs and data.
 */

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate email address
 * @param email - Email address to validate
 * @returns Validation result
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: '邮箱地址不能为空' }
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return { isValid: false, error: '请输入有效的邮箱地址' }
  }

  return { isValid: true }
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 8)
 * @returns Validation result
 */
export const validatePassword = (
  password: string,
  minLength: number = 8
): ValidationResult => {
  if (!password) {
    return { isValid: false, error: '密码不能为空' }
  }

  if (password.length < minLength) {
    return { isValid: false, error: `密码长度至少为 ${minLength} 个字符` }
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: '密码必须包含字母和数字' }
  }

  return { isValid: true }
}

/**
 * Validate URL
 * @param url - URL to validate
 * @param allowedProtocols - Allowed protocols (default: ['http', 'https'])
 * @returns Validation result
 */
export const validateUrl = (
  url: string,
  allowedProtocols: string[] = ['http', 'https']
): ValidationResult => {
  if (!url) {
    return { isValid: false, error: 'URL不能为空' }
  }

  try {
    const parsedUrl = new URL(url)

    if (!allowedProtocols.includes(parsedUrl.protocol.replace(':', ''))) {
      return {
        isValid: false,
        error: `URL协议必须是 ${allowedProtocols.join(' 或 ')}`,
      }
    }

    return { isValid: true }
  } catch {
    return { isValid: false, error: '请输入有效的URL' }
  }
}

/**
 * Validate Feishu document URL
 * @param url - URL to validate
 * @returns Validation result
 */
export const validateFeishuUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: false, error: '飞书文档链接不能为空' }
  }

  const feishuDomains = ['feishu.cn', 'larksuite.com']
  const urlValidation = validateUrl(url)

  if (!urlValidation.isValid) {
    return urlValidation
  }

  try {
    const parsedUrl = new URL(url)
    const isFeishuDomain = feishuDomains.some((domain) =>
      parsedUrl.hostname.includes(domain)
    )

    if (!isFeishuDomain) {
      return {
        isValid: false,
        error: '请输入有效的飞书文档链接',
      }
    }

    return { isValid: true }
  } catch {
    return { isValid: false, error: '请输入有效的飞书文档链接' }
  }
}

/**
 * Validate required field
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export const validateRequired = (
  value: any,
  fieldName: string = '此字段'
): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName}不能为空` }
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: `${fieldName}不能为空` }
  }

  return { isValid: true }
}

/**
 * Validate string length
 * @param value - String to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateLength = (
  value: string,
  options: {
    min?: number
    max?: number
    fieldName?: string
  }
): ValidationResult => {
  const { min, max, fieldName = '字段' } = options

  if (!value) {
    return { isValid: false, error: `${fieldName}不能为空` }
  }

  const length = value.length

  if (min !== undefined && length < min) {
    return {
      isValid: false,
      error: `${fieldName}长度不能少于 ${min} 个字符`,
    }
  }

  if (max !== undefined && length > max) {
    return {
      isValid: false,
      error: `${fieldName}长度不能超过 ${max} 个字符`,
    }
  }

  return { isValid: true }
}

/**
 * Validate number range
 * @param value - Number to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateNumberRange = (
  value: number,
  options: {
    min?: number
    max?: number
    fieldName?: string
  }
): ValidationResult => {
  const { min, max, fieldName = '数值' } = options

  if (value === null || value === undefined || isNaN(value)) {
    return { isValid: false, error: `${fieldName}必须是有效的数字` }
  }

  if (min !== undefined && value < min) {
    return {
      isValid: false,
      error: `${fieldName}不能小于 ${min}`,
    }
  }

  if (max !== undefined && value > max) {
    return {
      isValid: false,
      error: `${fieldName}不能大于 ${max}`,
    }
  }

  return { isValid: true }
}

/**
 * Validate date
 * @param dateString - Date string to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateDate = (
  dateString: string,
  options?: {
    afterToday?: boolean
    beforeToday?: boolean
    afterDate?: string
    beforeDate?: string
    fieldName?: string
  }
): ValidationResult => {
  const {
    afterToday,
    beforeToday,
    afterDate,
    beforeDate,
    fieldName = '日期',
  } = options || {}

  if (!dateString) {
    return { isValid: false, error: `${fieldName}不能为空` }
  }

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${fieldName}格式无效` }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (afterToday) {
    date.setHours(0, 0, 0, 0)
    if (date <= today) {
      return { isValid: false, error: `${fieldName}必须晚于今天` }
    }
  }

  if (beforeToday) {
    date.setHours(0, 0, 0, 0)
    if (date >= today) {
      return { isValid: false, error: `${fieldName}必须早于今天` }
    }
  }

  if (afterDate) {
    const compareDate = new Date(afterDate)
    if (date <= compareDate) {
      return { isValid: false, error: `${fieldName}必须晚于指定日期` }
    }
  }

  if (beforeDate) {
    const compareDate = new Date(beforeDate)
    if (date >= compareDate) {
      return { isValid: false, error: `${fieldName}必须早于指定日期` }
    }
  }

  return { isValid: true }
}

/**
 * Validate phone number (Chinese format)
 * @param phone - Phone number to validate
 * @returns Validation result
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: '手机号不能为空' }
  }

  // Chinese mobile phone regex: starts with 1, followed by 10 digits
  const phoneRegex = /^1[3-9]\d{9}$/

  // Remove spaces and hyphens
  const cleaned = phone.replace(/[\s-]/g, '')

  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, error: '请输入有效的手机号' }
  }

  return { isValid: true }
}

/**
 * Validate Chinese ID card number
 * @param idCard - ID card number to validate
 * @returns Validation result
 */
export const validateIdCard = (idCard: string): ValidationResult => {
  if (!idCard) {
    return { isValid: false, error: '身份证号不能为空' }
  }

  // 18-digit ID card regex
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/

  if (!idCardRegex.test(idCard)) {
    return { isValid: false, error: '请输入有效的身份证号' }
  }

  return { isValid: true }
}

/**
 * Validate budget amount (must be positive)
 * @param amount - Amount to validate
 * @returns Validation result
 */
export const validateBudgetAmount = (amount: number): ValidationResult => {
  if (amount === null || amount === undefined) {
    return { isValid: false, error: '预算金额不能为空' }
  }

  if (isNaN(amount)) {
    return { isValid: false, error: '预算金额必须是有效的数字' }
  }

  if (amount <= 0) {
    return { isValid: false, error: '预算金额必须大于0' }
  }

  if (amount > 999999999.99) {
    return { isValid: false, error: '预算金额过大' }
  }

  return { isValid: true }
}

/**
 * Validate expense amount (must be positive)
 * @param amount - Amount to validate
 * @returns Validation result
 */
export const validateExpenseAmount = (amount: number): ValidationResult => {
  if (amount === null || amount === undefined) {
    return { isValid: false, error: '支出金额不能为空' }
  }

  if (isNaN(amount)) {
    return { isValid: false, error: '支出金额必须是有效的数字' }
  }

  if (amount <= 0) {
    return { isValid: false, error: '支出金额必须大于0' }
  }

  return { isValid: true }
}

/**
 * Combine multiple validations
 * @param validations - Array of validation results
 * @returns Combined validation result (first error encountered)
 */
export const combineValidations = (
  validations: ValidationResult[]
): ValidationResult => {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation
    }
  }
  return { isValid: true }
}

/**
 * DocumentLinkForm component for adding/editing document links.
 */
import { useState, useEffect } from 'react'
import { DocumentLink, DocumentLinkCreateRequest } from '@/types/project'

interface DocumentLinkFormProps {
  document?: DocumentLink
  onSubmit: (data: DocumentLinkCreateRequest) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  submitLabel?: string
}

export const DocumentLinkForm = ({
  document,
  onSubmit,
  onCancel,
  submitLabel = '添加文档'
}: DocumentLinkFormProps) => {
  const [formData, setFormData] = useState({
    url: document?.url || '',
    title: document?.title || '',
    description: document?.description || '',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (document) {
      setFormData({
        url: document.url,
        title: document.title,
        description: document.description || '',
      })
    }
  }, [document])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Validation
    if (!formData.url.trim()) {
      setError('文档链接不能为空')
      setSubmitting(false)
      return
    }

    if (!formData.title.trim()) {
      setError('文档标题不能为空')
      setSubmitting(false)
      return
    }

    // Validate URL format (basic check)
    try {
      new URL(formData.url)
    } catch {
      setError('请输入有效的 URL')
      setSubmitting(false)
      return
    }

    try {
      const submitData: DocumentLinkCreateRequest = {
        url: formData.url.trim(),
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
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

      {/* Document URL */}
      <div>
        <label htmlFor="url" className="block text-sm font-medium mb-1">
          文档链接 <span className="text-red-500">*</span>
        </label>
        <input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => handleChange('url', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/document"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          支持飞书文档、Google Docs 等任何在线文档链接
        </p>
      </div>

      {/* Document Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          文档标题 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="输入文档标题"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          描述
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="输入文档描述（可选）"
          rows={3}
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

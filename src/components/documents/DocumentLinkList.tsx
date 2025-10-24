/**
 * DocumentLinkList component for displaying document links.
 */
import { DocumentLink } from '@/types/project'

interface DocumentLinkListProps {
  documents: DocumentLink[]
  onEdit?: (document: DocumentLink) => void
  onDelete?: (document: DocumentLink) => void
  emptyMessage?: string
}

export const DocumentLinkList = ({
  documents,
  onEdit,
  onDelete,
  emptyMessage = '暂无文档链接'
}: DocumentLinkListProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN')
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <div
          key={doc.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Document Title */}
              <h4 className="font-medium mb-1">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {doc.title}
                </a>
              </h4>

              {/* Description */}
              {doc.description && (
                <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
              )}

              {/* Meta Information */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>创建时间: {formatDate(doc.created_at)}</span>
              </div>
            </div>

            {/* Actions */}
            {(onEdit || onDelete) && (
              <div className="flex gap-2 ml-4">
                {onEdit && (
                  <button
                    onClick={() => onEdit(doc)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    编辑
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(doc)}
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

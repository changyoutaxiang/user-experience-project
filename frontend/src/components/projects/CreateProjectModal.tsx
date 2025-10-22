/**
 * CreateProjectModal component for creating new projects.
 */
import { ProjectForm } from './ProjectForm'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<any>
}

export const CreateProjectModal = ({ isOpen, onClose, onSubmit }: CreateProjectModalProps) => {
  if (!isOpen) return null

  const handleSubmit = async (data: any) => {
    const result = await onSubmit(data)
    if (result.success) {
      onClose()
    }
    return result
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">创建新项目</h2>
        <ProjectForm onSubmit={handleSubmit} onCancel={onClose} submitLabel="创建项目" />
      </div>
    </div>
  )
}

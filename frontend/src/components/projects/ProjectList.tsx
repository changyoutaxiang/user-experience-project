/**
 * ProjectList component for displaying a list of projects.
 */
import { Project } from '@/types/project'
import { ProjectCard } from './ProjectCard'

interface ProjectListProps {
  projects: Project[]
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
  emptyMessage?: string
}

export const ProjectList = ({
  projects,
  onEdit,
  onDelete,
  emptyMessage = '暂无项目',
}: ProjectListProps) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

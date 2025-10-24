import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// 项目卡片组件测试
interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  budget: number;
  status: string;
}

interface ProjectCardProps {
  project: Project;
}

// 临时 ProjectCard 组件用于测试
const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => (
  <div className="project-card" data-testid="project-card">
    <h3>{project.name}</h3>
    <p>{project.description}</p>
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${project.progress}%` }}
        data-testid="progress-bar"
      />
      <span>{project.progress}%</span>
    </div>
    <div className="budget">
      预算: ¥{project.budget.toLocaleString()}
    </div>
    <div className="status">{project.status}</div>
  </div>
);

describe('ProjectCard Component', () => {
  const mockProject: Project = {
    id: '1',
    name: '测试项目',
    description: '这是一个测试项目描述',
    progress: 75,
    budget: 100000,
    status: '进行中',
  };

  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('测试项目')).toBeInTheDocument();
    expect(screen.getByText('这是一个测试项目描述')).toBeInTheDocument();
    expect(screen.getByText('进行中')).toBeInTheDocument();
  });

  it('displays correct progress percentage', () => {
    render(<ProjectCard project={mockProject} />);

    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveStyle({ width: '75%' });
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('formats budget correctly', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText(/¥100,000/)).toBeInTheDocument();
  });

  it('renders project card container', () => {
    render(<ProjectCard project={mockProject} />);

    const card = screen.getByTestId('project-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('project-card');
  });

  it('handles zero progress', () => {
    const zeroProgressProject = { ...mockProject, progress: 0 };
    render(<ProjectCard project={zeroProgressProject} />);

    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveStyle({ width: '0%' });
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('handles 100% progress', () => {
    const completeProject = { ...mockProject, progress: 100 };
    render(<ProjectCard project={completeProject} />);

    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveStyle({ width: '100%' });
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});

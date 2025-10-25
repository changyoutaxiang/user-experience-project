-- =====================================================
-- Supabase 数据库迁移脚本
-- 用户体验拯救项目管理系统
-- =====================================================
-- 执行顺序：在 Supabase SQL Editor 中按顺序执行
-- =====================================================

-- =====================================================
-- 1. 创建枚举类型
-- =====================================================

-- 用户角色枚举
CREATE TYPE userrole AS ENUM ('admin', 'member');

-- 项目状态枚举
CREATE TYPE projectstatus AS ENUM ('planning', 'in_progress', 'completed', 'archived');

-- 任务状态枚举
CREATE TYPE taskstatus AS ENUM ('todo', 'in_progress', 'in_review', 'completed', 'cancelled');

-- 任务优先级枚举
CREATE TYPE taskpriority AS ENUM ('low', 'medium', 'high', 'urgent');

-- =====================================================
-- 2. 创建 users 表
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role userrole NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- users 表索引
CREATE UNIQUE INDEX ix_users_email ON users(email);
CREATE INDEX ix_users_role ON users(role);
CREATE INDEX ix_users_is_active ON users(is_active);

-- =====================================================
-- 3. 创建 audit_logs 表
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    resource_name VARCHAR(200),
    details JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT now(),
    ip_address VARCHAR(45)
);

-- audit_logs 表索引
CREATE INDEX ix_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX ix_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX ix_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX ix_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX ix_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX ix_audit_logs_user_timestamp ON audit_logs(user_id, timestamp);
CREATE INDEX ix_audit_logs_resource_type_id ON audit_logs(resource_type, resource_id);
CREATE INDEX ix_audit_logs_action_timestamp ON audit_logs(action_type, timestamp);

-- =====================================================
-- 4. 创建 projects 表
-- =====================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status projectstatus NOT NULL DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
    spent NUMERIC(15, 2) NOT NULL DEFAULT 0,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- projects 表索引
CREATE INDEX ix_projects_id ON projects(id);
CREATE INDEX ix_projects_name ON projects(name);
CREATE INDEX ix_projects_status ON projects(status);
CREATE INDEX ix_projects_end_date ON projects(end_date);
CREATE INDEX ix_projects_owner_id ON projects(owner_id);
CREATE INDEX ix_projects_created_at ON projects(created_at);
CREATE INDEX ix_projects_start_date ON projects(start_date);
CREATE INDEX ix_projects_status_created_at ON projects(status, created_at);

-- =====================================================
-- 5. 创建 project_members 表
-- =====================================================

CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50),
    assigned_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_project_member UNIQUE (project_id, user_id)
);

-- project_members 表索引
CREATE INDEX ix_project_members_project_id ON project_members(project_id);
CREATE INDEX ix_project_members_user_id ON project_members(user_id);
CREATE INDEX ix_project_members_joined_at ON project_members(assigned_at);
CREATE INDEX ix_project_members_user_joined ON project_members(user_id, assigned_at);

-- =====================================================
-- 6. 创建 tasks 表
-- =====================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status taskstatus NOT NULL DEFAULT 'todo',
    priority taskpriority NOT NULL DEFAULT 'medium',
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- tasks 表索引
CREATE INDEX ix_tasks_id ON tasks(id);
CREATE INDEX ix_tasks_name ON tasks(name);
CREATE INDEX ix_tasks_status ON tasks(status);
CREATE INDEX ix_tasks_priority ON tasks(priority);
CREATE INDEX ix_tasks_project_id ON tasks(project_id);
CREATE INDEX ix_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX ix_tasks_due_date ON tasks(due_date);
CREATE INDEX ix_tasks_created_by_id ON tasks(created_by_id);
CREATE INDEX ix_tasks_created_at ON tasks(created_at);
CREATE INDEX ix_tasks_assignee_status ON tasks(assignee_id, status);
CREATE INDEX ix_tasks_project_status ON tasks(project_id, status);
CREATE INDEX ix_tasks_status_priority ON tasks(status, priority);

-- =====================================================
-- 7. 创建 document_links 表
-- =====================================================

CREATE TABLE document_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- document_links 表索引
CREATE INDEX ix_document_links_project_id ON document_links(project_id);
CREATE INDEX ix_document_links_task_id ON document_links(task_id);
CREATE INDEX ix_document_links_created_by_id ON document_links(created_by_id);
CREATE INDEX ix_document_links_created_at ON document_links(created_at);

-- =====================================================
-- 8. 创建 expenses 表
-- =====================================================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    recorded_at TIMESTAMP NOT NULL,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- expenses 表索引
CREATE INDEX ix_expenses_project_id ON expenses(project_id);
CREATE INDEX ix_expenses_recorded_at ON expenses(recorded_at);
CREATE INDEX ix_expenses_created_by_id ON expenses(created_by_id);
CREATE INDEX ix_expenses_created_at ON expenses(created_at);
CREATE INDEX ix_expenses_category ON expenses(category);
CREATE INDEX ix_expenses_project_created ON expenses(project_id, created_at);

-- =====================================================
-- 9. 创建触发器函数（自动更新 updated_at）
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为各表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_links_updated_at BEFORE UPDATE ON document_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. 插入初始管理员用户（可选）
-- =====================================================
-- 注意：密码为 admin123456 的 bcrypt 哈希值
-- 建议部署后立即修改密码

INSERT INTO users (id, name, email, hashed_password, role, is_active)
VALUES (
    gen_random_uuid(),
    '系统管理员',
    'admin@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lW8sK8rCcIXm',
    'admin',
    true
);

-- =====================================================
-- 完成！数据库迁移完成
-- =====================================================
-- 下一步：
-- 1. 在 Supabase 中启用 Row Level Security (RLS) 如果需要
-- 2. 配置环境变量
-- 3. 部署后端到 Vercel 或其他平台
-- 4. 部署前端到 Vercel
-- =====================================================

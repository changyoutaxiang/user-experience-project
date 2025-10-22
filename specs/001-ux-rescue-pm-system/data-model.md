# Data Model: 用户体验拯救项目群管理系统

**Date**: 2025-10-21
**Feature**: 001-ux-rescue-pm-system
**Purpose**: 定义系统的数据实体、关系和验证规则

## Overview

本文档定义了项目群管理系统的数据模型。所有实体基于 spec.md 的"Key Entities"部分设计,支持PostgreSQL关系型数据库实现。

## Entity Relationship Diagram

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       │ 1:N (created_by)
       │
       ├──────────────────────────────┬───────────────────┐
       │                              │                   │
       ▼                              ▼                   ▼
┌──────────────┐    N:M    ┌──────────────┐      ┌──────────────┐
│   Project    │◄─────────►│ProjectMember │      │  AuditLog    │
└──────┬───────┘           └──────────────┘      └──────────────┘
       │
       │ 1:N
       │
       ├──────────────────┬────────────────┬────────────────┐
       │                  │                │                │
       ▼                  ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│     Task     │  │   Expense    │ │DocumentLink  │ │DocumentLink  │
│              │  │              │ │(project_id)  │ │(task_id)     │
└──────┬───────┘  └──────────────┘ └──────────────┘ └──────────────┘
       │
       │ N:1 (assigned_to)
       │
       ▼
   ┌───────┐
   │ User  │
   └───────┘
```

## Entities

### 1. User (用户)

**用途**: 代表系统使用者,包含认证和权限信息

**字段**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | 用户唯一标识 |
| name | VARCHAR(100) | NOT NULL | 用户姓名 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | 邮箱(登录用) |
| hashed_password | VARCHAR(255) | NOT NULL | 密码哈希值(bcrypt) |
| role | ENUM('admin', 'member') | NOT NULL | 角色 |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | 账户是否激活 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引**:
- PRIMARY KEY: id
- UNIQUE INDEX: email
- INDEX: role

**验证规则**:
- email 必须符合email格式(正则验证)
- name 长度 1-100字符
- password 明文最少8位,包含字母和数字(哈希前验证)
- role 仅允许'admin'或'member'

**State Transitions**: 无状态机(is_active可手动切换)

**关系**:
- 1:N → Project (用户创建的项目,不严格外键)
- 1:N → Task (用户负责的任务, assigned_to外键)
- N:M ←→ Project (通过ProjectMember多对多)
- 1:N → DocumentLink (用户添加的文档链接, created_by外键)
- 1:N → AuditLog (用户的操作记录, user_id外键)

---

### 2. Project (项目)

**用途**: 代表"用户体验拯救"项目群中的一个项目

**字段**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | 项目唯一标识 |
| name | VARCHAR(200) | NOT NULL | 项目名称 |
| description | TEXT | NULLABLE | 项目描述 |
| status | ENUM | NOT NULL, DEFAULT 'planning' | 项目状态 |
| budget_amount | DECIMAL(15,2) | NOT NULL, DEFAULT 0 | 预算总额(元) |
| actual_spent | DECIMAL(15,2) | NOT NULL, DEFAULT 0 | 实际花费(元) |
| start_date | DATE | NULLABLE | 开始日期 |
| planned_end_date | DATE | NULLABLE | 计划完成日期 |
| is_overdue | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否逾期(系统计算) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**ENUM Values**:
- status: 'planning'(计划中), 'in_progress'(进行中), 'completed'(已完成), 'archived'(已归档)

**索引**:
- PRIMARY KEY: id
- INDEX: status
- INDEX: is_overdue
- COMPOSITE INDEX: (status, is_overdue) - 仪表盘查询优化

**验证规则**:
- name 长度 1-200字符,不能为空字符串
- budget_amount >= 0
- actual_spent >= 0
- planned_end_date >= start_date (如果两者都存在)
- is_overdue 由系统自动设置(定时任务):
  - IF planned_end_date < TODAY AND status NOT IN ('completed', 'archived') THEN is_overdue = TRUE

**计算字段**:
- budget_usage_rate = (actual_spent / budget_amount) * 100 (前端或API计算)
- remaining_budget = budget_amount - actual_spent (前端或API计算)
- is_over_budget = actual_spent > budget_amount (前端或API计算)

**State Transitions**:
```
planning → in_progress → completed → archived
   ↓           ↓
(可回退到任何前一状态,但通常单向流动)
```

**关系**:
- 1:N → Task (项目下的任务, project_id外键, ON DELETE CASCADE)
- 1:N → Expense (项目的花费记录, project_id外键, ON DELETE CASCADE)
- 1:N → DocumentLink (项目的文档链接, related_project_id外键, ON DELETE CASCADE)
- N:M ←→ User (通过ProjectMember多对多)

---

### 3. Task (任务)

**用途**: 项目下的具体工作项

**字段**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | 任务唯一标识 |
| project_id | UUID | NOT NULL, FK | 所属项目 |
| name | VARCHAR(200) | NOT NULL | 任务名称 |
| description | TEXT | NULLABLE | 任务描述 |
| status | ENUM | NOT NULL, DEFAULT 'todo' | 任务状态 |
| due_date | DATE | NULLABLE | 截止日期 |
| assigned_to | UUID | NULLABLE, FK | 负责人(User.id) |
| is_overdue | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否逾期(系统计算) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**ENUM Values**:
- status: 'todo'(待办), 'in_progress'(进行中), 'completed'(已完成)

**索引**:
- PRIMARY KEY: id
- FK INDEX: project_id (ON DELETE CASCADE)
- FK INDEX: assigned_to (ON DELETE SET NULL)
- INDEX: status
- INDEX: is_overdue
- COMPOSITE INDEX: (assigned_to, status) - "我的任务"查询优化

**验证规则**:
- name 长度 1-200字符
- assigned_to 必须是有效的User.id (如果非NULL)
- project_id 必须是有效的Project.id
- is_overdue 由系统自动设置(定时任务):
  - IF due_date < TODAY AND status != 'completed' THEN is_overdue = TRUE

**State Transitions**:
```
todo → in_progress → completed
  ↓         ↓
(可回退到任何前一状态)
```

**关系**:
- N:1 → Project (所属项目, project_id外键)
- N:1 → User (负责人, assigned_to外键)
- 1:N → DocumentLink (任务的文档链接, related_task_id外键, ON DELETE CASCADE)

---

### 4. Expense (花费记录)

**用途**: 项目的支出记录

**字段**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | 花费记录唯一标识 |
| project_id | UUID | NOT NULL, FK | 所属项目 |
| amount | DECIMAL(15,2) | NOT NULL | 金额(元) |
| description | TEXT | NULLABLE | 说明 |
| recorded_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 记录时间 |
| created_by | UUID | NULLABLE, FK | 记录人(User.id) |

**索引**:
- PRIMARY KEY: id
- FK INDEX: project_id (ON DELETE CASCADE)
- FK INDEX: created_by (ON DELETE SET NULL)
- INDEX: recorded_at (用于时间范围查询)

**验证规则**:
- amount > 0
- project_id 必须是有效的Project.id
- created_by 必须是有效的User.id (如果非NULL)

**触发器逻辑** (业务层实现):
- 插入Expense后,更新Project.actual_spent += amount
- 删除Expense后,更新Project.actual_spent -= amount

**关系**:
- N:1 → Project (所属项目, project_id外键)
- N:1 → User (记录人, created_by外键)

---

### 5. DocumentLink (文档链接)

**用途**: 关联到项目或任务的飞书文档链接

**字段**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | 文档链接唯一标识 |
| url | VARCHAR(500) | NOT NULL | 飞书文档URL |
| title | VARCHAR(200) | NULLABLE, DEFAULT '相关文档' | 文档标题 |
| related_type | ENUM('project', 'task') | NOT NULL | 关联类型 |
| related_project_id | UUID | NULLABLE, FK | 关联的项目ID |
| related_task_id | UUID | NULLABLE, FK | 关联的任务ID |
| created_by | UUID | NULLABLE, FK | 添加人(User.id) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 添加时间 |

**ENUM Values**:
- related_type: 'project', 'task'

**索引**:
- PRIMARY KEY: id
- FK INDEX: related_project_id (ON DELETE CASCADE)
- FK INDEX: related_task_id (ON DELETE CASCADE)
- FK INDEX: created_by (ON DELETE SET NULL)
- INDEX: related_type

**验证规则**:
- url 必须包含 'feishu.cn' 或 'larksuite.com' 域名
- url 长度 1-500字符
- title 长度 0-200字符
- 互斥约束: (related_project_id IS NOT NULL AND related_task_id IS NULL) OR (related_project_id IS NULL AND related_task_id IS NOT NULL)
- related_type 必须与实际关联类型一致

**CHECK约束** (数据库级别):
```sql
CHECK (
  (related_type = 'project' AND related_project_id IS NOT NULL AND related_task_id IS NULL) OR
  (related_type = 'task' AND related_task_id IS NOT NULL AND related_project_id IS NULL)
)
```

**关系**:
- N:1 → Project (关联的项目, related_project_id外键)
- N:1 → Task (关联的任务, related_task_id外键)
- N:1 → User (添加人, created_by外键)

---

### 6. ProjectMember (项目成员关系)

**用途**: 多对多关系,表示哪些用户是哪些项目的成员

**字段**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | 关系唯一标识 |
| project_id | UUID | NOT NULL, FK | 项目ID |
| user_id | UUID | NOT NULL, FK | 用户ID |
| joined_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 加入时间 |

**索引**:
- PRIMARY KEY: id
- UNIQUE COMPOSITE INDEX: (project_id, user_id) - 防止重复添加
- FK INDEX: project_id (ON DELETE CASCADE)
- FK INDEX: user_id (ON DELETE CASCADE)

**验证规则**:
- project_id 必须是有效的Project.id
- user_id 必须是有效的User.id
- 唯一约束: 同一用户不能重复添加到同一项目

**关系**:
- N:1 → Project (project_id外键)
- N:1 → User (user_id外键)

---

### 7. AuditLog (操作日志)

**用途**: 系统操作的审计记录

**字段**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | 日志唯一标识 |
| user_id | UUID | NULLABLE, FK | 操作人(User.id) |
| action_type | VARCHAR(50) | NOT NULL | 操作类型 |
| resource_type | VARCHAR(50) | NOT NULL | 操作对象类型 |
| resource_id | UUID | NULLABLE | 操作对象ID |
| resource_name | VARCHAR(200) | NULLABLE | 操作对象名称(快照) |
| details | JSONB | NULLABLE | 操作详细信息(可选) |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | 操作时间 |
| ip_address | VARCHAR(45) | NULLABLE | 操作IP地址 |

**action_type Values**:
- 'create_project', 'edit_project', 'delete_project'
- 'create_task', 'edit_task', 'delete_task'
- 'add_expense', 'delete_expense'
- 'create_user', 'edit_user', 'delete_user'
- 'add_document_link', 'delete_document_link'
- 'login', 'logout'

**resource_type Values**:
- 'project', 'task', 'expense', 'user', 'document_link'

**索引**:
- PRIMARY KEY: id
- FK INDEX: user_id (ON DELETE SET NULL)
- INDEX: timestamp (用于时间范围查询)
- INDEX: action_type
- COMPOSITE INDEX: (user_id, timestamp) - 查询特定用户操作历史

**验证规则**:
- action_type 必须是预定义值之一
- resource_type 必须是预定义值之一
- user_id 必须是有效的User.id (如果非NULL)
- timestamp 默认为当前时间

**Retention Policy**: 完整保留历史(不自动清理)

**关系**:
- N:1 → User (操作人, user_id外键)

---

## Database Schema Summary

**总表数**: 7张表
- 核心业务表: User, Project, Task, Expense, DocumentLink (5张)
- 关系表: ProjectMember (1张)
- 审计表: AuditLog (1张)

**总字段数**: 约70个字段

**关系统计**:
- 1:N 关系: 8个
- N:M 关系: 1个(User-Project通过ProjectMember)
- ON DELETE CASCADE: 6个(保证数据完整性)
- ON DELETE SET NULL: 5个(保留历史记录)

## Data Integrity Rules

### 级联删除 (CASCADE)
- 删除Project → 级联删除 Task, Expense, DocumentLink, ProjectMember
- 删除Task → 级联删除 DocumentLink(related_task_id)
- 删除User → 级联删除 ProjectMember

### 字段清空 (SET NULL)
- 删除User → Task.assigned_to 设为NULL(任务不删除,需重新分配)
- 删除User → Expense.created_by, DocumentLink.created_by, AuditLog.user_id 设为NULL(保留历史)

### 唯一性约束
- User.email (UNIQUE)
- (ProjectMember.project_id, ProjectMember.user_id) (UNIQUE COMPOSITE)

### CHECK约束
- Project.budget_amount >= 0
- Project.actual_spent >= 0
- Expense.amount > 0
- DocumentLink: (related_project_id XOR related_task_id) 互斥

## Migration Strategy

使用 Alembic 进行版本化数据库迁移:

1. **Initial Migration**: 创建所有7张表
2. **Incremental Migrations**: 支持P1/P2/P3增量交付
   - P1: User, Project, ProjectMember, AuditLog
   - P2: Task, Expense, DocumentLink
   - P3: 无新表,增强AuditLog记录

3. **Rollback Support**: 所有迁移支持回滚
4. **Index Creation**: 在数据导入后创建索引(性能优化)

## Performance Considerations

### 索引策略
- 主键: 所有表使用UUID
- 外键: 所有FK字段创建索引
- 查询优化: 基于常见查询模式创建复合索引
- 避免过度索引: 不为低选择性字段创建单独索引

### 查询优化
- 使用 `joinedload` 预加载关联对象
- 分页查询: LIMIT + OFFSET
- 仪表盘聚合: 使用 SUM, COUNT 等聚合函数
- 避免SELECT *: 只查询需要的字段

### 数据增长预估
- 1年后数据量: 100个项目 + 5000个任务 + 500条花费 + 1000个文档链接 + 50000条日志
- 总行数: 约5.7万行
- 数据库大小: 预估 < 100MB(包含索引)
- 性能: PostgreSQL可轻松处理该规模

## Validation Summary

所有验证规则分三层实现:
1. **数据库层**: CHECK约束, UNIQUE约束, FK约束
2. **业务层** (FastAPI + Pydantic): 复杂验证逻辑(URL格式、日期范围等)
3. **前端层** (React): 用户体验优化(即时反馈)

---

**Last Updated**: 2025-10-21

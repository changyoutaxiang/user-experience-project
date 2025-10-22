# Implementation Plan: 用户体验拯救项目群管理系统

**Branch**: `001-ux-rescue-pm-system` | **Date**: 2025-10-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-ux-rescue-pm-system/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

构建一个 Web 应用,用于管理"用户体验拯救"项目群。系统支持100个项目、5000个任务、100个用户的规模,提供项目群仪表盘、项目看板、任务管理、预算跟踪、人员管理和操作日志功能。核心价值是为一年期项目群提供统一的中央管理视图,支持增量交付(P1: 仪表盘+项目管理, P2: 任务+预算, P3: 人员管理)。技术方案采用现代 Web 全栈架构,前后端分离,RESTful API设计,支持桌面浏览器访问。

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x + React 18.x
- Backend: Python 3.11+

**Primary Dependencies**:
- Frontend: React 18, React Router, Axios, Tailwind CSS, shadcn/ui
- Backend: FastAPI 0.110+, SQLAlchemy 2.0+, Pydantic 2.x
- Database Driver: asyncpg (PostgreSQL async driver)

**Storage**: PostgreSQL 15+ (关系型数据库,支持事务、外键约束、索引优化)

**Testing**:
- Frontend: Vitest + React Testing Library
- Backend: pytest + pytest-asyncio
- E2E: Playwright (optional for critical flows)

**Target Platform**:
- Desktop browsers (Chrome 120+, Firefox 120+, Safari 17+, Edge 120+)
- Minimum resolution: 1280x720
- Mobile responsive: 次要优先级

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- API响应时间: p95 < 500ms (大多数请求 < 200ms)
- 页面首次加载: < 3秒 (FCP < 1.5s)
- 仪表盘数据刷新: < 2秒
- 支持100个并发用户无性能降级

**Constraints**:
- 数据库查询优化: 避免N+1查询,使用索引
- 前端包大小: 初始加载 < 500KB (gzipped)
- 内存占用: 后端单进程 < 512MB
- 企业内网部署,HTTPS + 基础认证即可

**Scale/Scope**:
- 用户: 100人
- 项目: 100个
- 任务: 5000个 (平均每项目50个)
- 文档链接: 预估1000个 (项目和任务总计)
- 操作日志: 预估50,000条/年 (每日约137条操作)
- 预算记录: 预估500条 (平均每项目5条花费记录)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

基于 `.specify/memory/constitution.md` 的原则检查:

### ✅ I. 规格优先原则
- **状态**: 通过
- **验证**: 已完成完整的 spec.md,包含用户场景、功能需求(FR-001至FR-039)、成功标准
- **行动**: 技术实施严格基于规格,不引入规格外功能

### ✅ II. 用户场景驱动
- **状态**: 通过
- **验证**: 5个用户故事按优先级排序(P1/P2/P3),每个都有 Given-When-Then 验收场景
- **行动**: 技术设计和数据模型将直接映射到用户故事需求

### ✅ III. 增量交付原则
- **状态**: 通过
- **验证**:
  - P1 (MVP): 项目群总览+项目管理 - 可独立交付核心价值
  - P2: 任务管理+预算跟踪 - 基于P1扩展
  - P3: 人员管理+操作日志 - 支撑功能
- **行动**:
  - 数据库设计支持增量添加表
  - API设计支持版本化和扩展
  - 前端组件化,支持模块化开发

### ✅ IV. 测试可验证性
- **状态**: 通过
- **验证**: 所有39个功能需求都明确可测试,成功标准都可量化
- **行动**:
  - 为每个 API 端点编写合约测试
  - 为关键用户流程编写集成测试
  - 成功标准转化为性能基准测试

### ✅ V. 文档代码同步
- **状态**: 通过
- **验证**: 将生成 data-model.md, contracts/, quickstart.md 与代码结构对齐
- **行动**:
  - API 合约文档(OpenAPI)自动生成
  - 数据模型文档与 SQLAlchemy 模型一致
  - README 和 quickstart 与实际部署流程同步

### 复杂度评估
**无违规**: 项目使用标准的 Web 全栈架构,无不必要的复杂性。

## Project Structure

### Documentation (this feature)

```
specs/001-ux-rescue-pm-system/
├── spec.md              # Feature specification (已完成)
├── plan.md              # This file (当前文件)
├── research.md          # Phase 0 output (待生成)
├── data-model.md        # Phase 1 output (待生成)
├── quickstart.md        # Phase 1 output (待生成)
├── contracts/           # Phase 1 output (待生成)
│   ├── openapi.yaml     # OpenAPI 3.1 specification
│   └── README.md        # API 使用说明
├── checklists/
│   └── requirements.md  # 规格质量检查清单 (已完成)
└── tasks.md             # Phase 2 output (/speckit.tasks - 未创建)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI 应用入口
│   │   ├── deps.py              # 依赖注入(数据库会话等)
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py          # 认证登录
│   │       ├── users.py         # 用户管理
│   │       ├── projects.py      # 项目CRUD
│   │       ├── tasks.py         # 任务CRUD
│   │       ├── expenses.py      # 预算花费
│   │       ├── documents.py     # 文档链接
│   │       ├── dashboard.py     # 仪表盘聚合数据
│   │       └── audit_logs.py    # 操作日志
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py              # User 模型
│   │   ├── project.py           # Project 模型
│   │   ├── task.py              # Task 模型
│   │   ├── expense.py           # Expense 模型
│   │   ├── document_link.py     # DocumentLink 模型
│   │   ├── project_member.py    # ProjectMember 关系表
│   │   └── audit_log.py         # AuditLog 模型
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py              # Pydantic schemas for User
│   │   ├── project.py           # Pydantic schemas for Project
│   │   ├── task.py              # Pydantic schemas for Task
│   │   ├── expense.py           # Pydantic schemas for Expense
│   │   ├── document_link.py     # Pydantic schemas for DocumentLink
│   │   ├── dashboard.py         # Dashboard response schemas
│   │   └── audit_log.py         # AuditLog schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py      # 认证逻辑
│   │   ├── user_service.py      # 用户业务逻辑
│   │   ├── project_service.py   # 项目业务逻辑
│   │   ├── task_service.py      # 任务业务逻辑
│   │   ├── expense_service.py   # 预算业务逻辑
│   │   ├── document_service.py  # 文档链接业务逻辑
│   │   ├── dashboard_service.py # 仪表盘聚合逻辑
│   │   ├── audit_service.py     # 操作日志记录
│   │   └── overdue_checker.py   # 逾期检查定时任务
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # 配置管理
│   │   ├── security.py          # 密码哈希、JWT
│   │   └── database.py          # 数据库连接
│   └── utils/
│       ├── __init__.py
│       └── validators.py        # URL验证等工具函数
├── tests/
│   ├── contract/
│   │   ├── test_auth_api.py
│   │   ├── test_projects_api.py
│   │   ├── test_tasks_api.py
│   │   ├── test_expenses_api.py
│   │   ├── test_documents_api.py
│   │   └── test_dashboard_api.py
│   ├── integration/
│   │   ├── test_project_workflow.py
│   │   ├── test_task_workflow.py
│   │   └── test_budget_workflow.py
│   └── unit/
│       ├── test_auth_service.py
│       ├── test_validators.py
│       └── test_overdue_checker.py
├── alembic/                     # 数据库迁移
│   ├── versions/
│   └── env.py
├── requirements.txt             # Python 依赖
├── pyproject.toml              # Python 项目配置
└── README.md

frontend/
├── src/
│   ├── main.tsx                # React 应用入口
│   ├── App.tsx                 # 根组件
│   ├── routes/
│   │   └── index.tsx           # 路由配置
│   ├── pages/
│   │   ├── LoginPage.tsx       # 登录页
│   │   ├── DashboardPage.tsx   # 仪表盘页
│   │   ├── ProjectBoardPage.tsx # 项目看板页
│   │   ├── ProjectDetailPage.tsx # 单项目详情页
│   │   ├── MyTasksPage.tsx     # 我的任务页
│   │   ├── UserManagementPage.tsx # 用户管理页
│   │   └── AuditLogPage.tsx    # 操作日志页
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── BudgetChart.tsx
│   │   │   └── OverdueAlert.tsx
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   └── ProjectMemberPicker.tsx
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── TaskForm.tsx
│   │   ├── budget/
│   │   │   ├── BudgetOverview.tsx
│   │   │   ├── ExpenseList.tsx
│   │   │   └── ExpenseForm.tsx
│   │   ├── documents/
│   │   │   ├── DocumentLinkList.tsx
│   │   │   └── DocumentLinkForm.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Modal.tsx
│   │       ├── Table.tsx
│   │       └── StatusBadge.tsx
│   ├── services/
│   │   ├── api.ts              # Axios 实例配置
│   │   ├── authService.ts
│   │   ├── projectService.ts
│   │   ├── taskService.ts
│   │   ├── expenseService.ts
│   │   ├── documentService.ts
│   │   ├── dashboardService.ts
│   │   └── auditLogService.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   ├── useTasks.ts
│   │   └── useDashboard.ts
│   ├── store/
│   │   ├── authStore.ts        # Zustand store for auth
│   │   └── index.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── project.ts
│   │   ├── task.ts
│   │   ├── expense.ts
│   │   ├── documentLink.ts
│   │   └── api.ts
│   └── utils/
│       ├── formatters.ts       # 日期、货币格式化
│       └── validators.ts       # 前端验证
├── tests/
│   └── components/
│       ├── ProjectCard.test.tsx
│       └── TaskList.test.tsx
├── public/
│   └── favicon.ico
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md

docker/
├── backend.Dockerfile
├── frontend.Dockerfile
└── nginx.conf                  # Nginx 反向代理配置

docker-compose.yml              # 本地开发环境
.env.example                    # 环境变量示例
.gitignore
README.md                       # 项目根 README
```

**Structure Decision**: 选择 **Option 2: Web application** 架构,原因:
1. 规格明确这是一个 Web 应用,需要前后端分离
2. 前端使用 React 提供交互式 UI
3. 后端提供 RESTful API,支持独立开发和测试
4. 清晰的职责分离:前端负责视图和交互,后端负责业务逻辑和数据持久化
5. 支持未来扩展(如移动端可复用同一套 API)

## Complexity Tracking

*无需填写 - 宪章检查全部通过,无违规需要解释*

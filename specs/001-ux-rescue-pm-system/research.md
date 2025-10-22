# Research & Technical Decisions: 用户体验拯救项目群管理系统

**Date**: 2025-10-21
**Feature**: 001-ux-rescue-pm-system
**Purpose**: 记录技术栈选择、架构决策和最佳实践研究

## Overview

本文档记录了项目群管理系统的技术研究和决策过程。所有决策都基于规格说明的需求、性能目标和约束条件。

## 技术栈决策

### 1. 前端框架: React 18 + TypeScript

**决策**: 使用 React 18 with TypeScript 5.x

**理由**:
- **生态成熟**: React拥有丰富的组件库(shadcn/ui, Ant Design)和状态管理方案
- **类型安全**: TypeScript提供编译时类型检查,减少运行时错误
- **性能优化**: React 18的并发特性(Concurrent Features)和自动批处理提升用户体验
- **团队熟悉度**: React是最流行的前端框架,易于招聘和维护
- **组件化**: 支持增量交付(P1/P2/P3),每个优先级可独立开发组件

**替代方案考虑**:
- **Vue 3**: 学习曲线更平缓,但生态和类型支持不如 React + TS
- **Svelte**: 性能优秀但生态较小,团队学习成本高
- **Angular**: 过于重量级,不适合中小型项目

**最佳实践**:
- 使用函数组件 + Hooks(useEffect, useState, useMemo等)
- 通过 React.lazy + Suspense 实现代码分割
- 使用 Zustand 进行轻量级状态管理(比 Redux 更简单)
- 采用 shadcn/ui 提供一致的UI组件(基于 Radix UI + Tailwind CSS)

### 2. 后端框架: FastAPI + Python 3.11+

**决策**: 使用 FastAPI 0.110+ with Python 3.11+

**理由**:
- **异步支持**: 原生支持 async/await,性能接近 Node.js
- **自动文档**: 自动生成 OpenAPI (Swagger) 文档,满足宪章的文档同步原则
- **类型验证**: Pydantic提供强大的数据验证和序列化
- **开发效率**: Python语法简洁,开发速度快
- **生态丰富**: SQLAlchemy(ORM), Alembic(迁移), pytest(测试)等工具成熟

**替代方案考虑**:
- **Django**: 功能全面但过于重量级,RESTful API支持不如 FastAPI 优雅
- **Flask**: 轻量但缺少异步支持和自动文档生成
- **Node.js + Express**: 性能好但 Python生态更适合数据处理

**最佳实践**:
- 使用依赖注入(Depends)管理数据库会话和认证
- 通过 Pydantic schemas 分离数据库模型和API响应
- 使用 async def 处理所有 I/O 密集操作
- 通过 middleware 实现统一的错误处理和日志记录

### 3. 数据库: PostgreSQL 15+

**决策**: 使用 PostgreSQL 15+ 作为主数据库

**理由**:
- **关系型需求**: 项目、任务、用户之间有复杂的关联关系
- **事务支持**: ACID特性保证数据一致性(如删除项目时级联删除任务和文档链接)
- **性能优化**: 支持索引(B-tree, GIN)、分区表、查询优化器
- **JSON支持**: 原生 JSONB 类型,可灵活扩展字段
- **开源免费**: 无许可证费用,社区活跃

**替代方案考虑**:
- **MySQL**: 流行但事务处理和JSON支持不如 PostgreSQL
- **MongoDB**: NoSQL灵活但不适合复杂关系查询
- **SQLite**: 轻量但不支持并发写入,不适合多用户场景

**最佳实践**:
- 为外键字段创建索引(user_id, project_id, task_id)
- 对常查询字段创建复合索引(project.status + project.is_overdue)
- 使用数据库级别的级联删除(ON DELETE CASCADE)
- 通过 Alembic 管理数据库迁移,支持版本化和回滚

### 4. UI组件库: shadcn/ui + Tailwind CSS

**决策**: 使用 shadcn/ui + Tailwind CSS

**理由**:
- **复制而非安装**: shadcn/ui 是复制组件到项目中,完全可定制
- **Radix UI基础**: 底层使用 Radix UI,提供无障碍(a11y)支持
- **Tailwind集成**: 与 Tailwind CSS 完美配合,快速样式开发
- **现代设计**: 提供美观的默认样式,符合现代Web应用审美

**替代方案考虑**:
- **Ant Design**: 功能全面但样式固化,定制困难
- **Material-UI**: 重量级,包体积大
- **自建组件**: 开发成本高,不适合快速交付

**最佳实践**:
- 使用 Tailwind utility classes 快速布局
- 通过 CSS variables 实现主题切换(预留未来深色模式)
- 保持组件可复用性(Button, Input, Select等基础组件)

### 5. 状态管理: Zustand

**决策**: 使用 Zustand 进行全局状态管理

**理由**:
- **轻量级**: 仅2KB,比 Redux 小很多
- **简单API**: 学习成本低,无需 actions/reducers
- **TypeScript友好**: 完美的类型推导
- **React集成**: hooks-first设计,符合 React 18 范式

**替代方案考虑**:
- **Redux Toolkit**: 功能强大但配置复杂,对中小型项目过度
- **Context API**: 简单但性能差(每次更新重渲染所有消费者)
- **Jotai/Recoil**: 原子化状态,学习曲线较陡

**最佳实践**:
- 只在store中存储真正全局的状态(auth, current user)
- 服务器状态通过 React Query 或 SWR 管理(可选)
- 局部状态优先使用 useState

### 6. 认证方案: JWT (JSON Web Tokens)

**决策**: 使用 JWT 进行用户认证

**理由**:
- **无状态**: 服务器不存储session,易于横向扩展
- **跨域友好**: 适合前后端分离架构
- **标准化**: 遵循RFC 7519标准,库支持广泛

**实施细节**:
- Access Token: 15分钟过期,存储在内存(不使用 localStorage 防XSS)
- Refresh Token: 7天过期,存储在 httpOnly cookie (防XSS)
- 密码哈希: 使用 bcrypt 或 Argon2

**最佳实践**:
- 使用 HTTPS 传输
- 实现 token 刷新机制
- 在 middleware 中验证 token
- 操作日志记录所有认证失败尝试

### 7. API设计: RESTful

**决策**: 采用 RESTful API 设计原则

**理由**:
- **标准化**: HTTP方法语义清晰(GET/POST/PUT/DELETE)
- **缓存友好**: GET请求可被浏览器和CDN缓存
- **简单直观**: URL结构即API文档,易于理解
- **工具支持**: Postman, curl, OpenAPI等工具完善

**API路由设计**:
```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/{user_id}
PUT    /api/v1/users/{user_id}
DELETE /api/v1/users/{user_id}
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/{project_id}
PUT    /api/v1/projects/{project_id}
DELETE /api/v1/projects/{project_id}
GET    /api/v1/projects/{project_id}/tasks
POST   /api/v1/projects/{project_id}/tasks
GET    /api/v1/tasks/{task_id}
PUT    /api/v1/tasks/{task_id}
DELETE /api/v1/tasks/{task_id}
GET    /api/v1/projects/{project_id}/expenses
POST   /api/v1/projects/{project_id}/expenses
GET    /api/v1/projects/{project_id}/documents
POST   /api/v1/projects/{project_id}/documents
DELETE /api/v1/documents/{doc_id}
GET    /api/v1/tasks/{task_id}/documents
POST   /api/v1/tasks/{task_id}/documents
GET    /api/v1/dashboard
GET    /api/v1/dashboard/stats
GET    /api/v1/my/tasks
GET    /api/v1/audit-logs
```

**最佳实践**:
- 使用复数名词(users, projects)
- 版本化API(/api/v1)
- 统一错误响应格式
- 使用HTTP状态码(200, 201, 400, 401, 404, 500)
- 分页查询(GET /api/v1/projects?page=1&limit=20)

### 8. 测试策略

**决策**: 采用金字塔测试策略

**测试层次**:
1. **单元测试**(70%): pytest测试services和utils
2. **集成测试**(20%): pytest测试API端点
3. **E2E测试**(10%): Playwright测试关键用户流程(可选)

**前端测试**:
- Vitest + React Testing Library 测试组件
- 模拟 API 响应(MSW - Mock Service Worker)

**后端测试**:
- pytest + pytest-asyncio 测试异步函数
- TestClient 测试FastAPI路由
- 使用测试数据库(PostgreSQL test instance)

**最佳实践**:
- TDD for critical business logic (预算计算、逾期检查)
- Mock外部依赖(飞书文档链接验证)
- 使用 fixtures 管理测试数据
- CI/CD中自动运行测试

### 9. 部署方案: Railway (生产) + Docker (本地开发)

**决策**: 使用 Railway 作为生产部署平台,Docker Compose 用于本地开发

**Railway 生产部署**:

**理由**:
- **零配置**: 自动检测 FastAPI 和 React 项目,无需复杂配置
- **内置数据库**: PostgreSQL 作为托管服务,自动备份和扩展
- **GitHub 集成**: 自动从 GitHub 部署,支持预览环境
- **环境变量**: 安全的环境变量管理,分离开发和生产配置
- **自动 HTTPS**: 自动提供 SSL 证书
- **简单定价**: 按使用量付费,对小型项目友好
- **快速部署**: 从 git push 到生产通常在 2-3 分钟内完成

**Railway 项目结构**:
```yaml
# railway.toml (Backend)
[build]
builder = "nixpacks"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "uvicorn src.api.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/api/v1/health"
restartPolicyType = "on-failure"

# railway.toml (Frontend)
[build]
builder = "nixpacks"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run preview"
```

**Railway 服务配置**:
1. **Backend Service**: FastAPI 应用
   - 自动环境变量: `$PORT`, `$RAILWAY_ENVIRONMENT`
   - 连接到 PostgreSQL 插件
2. **Frontend Service**: React 应用(Vite)
   - 指向 Backend 的 API URL
3. **PostgreSQL Plugin**: 托管数据库
   - 自动提供 `DATABASE_URL`

**Docker Compose 本地开发**:

**理由**:
- **环境一致性**: 本地开发环境接近生产
- **快速启动**: 一键启动所有服务
- **隔离性**: 前端、后端、数据库独立容器

**Docker Compose结构**:
```yaml
services:
  postgres:
    image: postgres:15
  backend:
    build: ./backend
    depends_on: postgres
  frontend:
    build: ./frontend
  nginx:
    image: nginx:alpine
    depends_on: [frontend, backend]
```

**最佳实践**:
- Railway: 使用环境变量存储敏感信息
- Railway: 启用自动部署(main分支 → 生产, PR → 预览环境)
- Railway: 配置健康检查确保服务可用
- Docker: 使用多阶段构建减小镜像大小
- Docker: 挂载卷持久化本地数据库数据

## 性能优化策略

### 数据库查询优化
- 使用 `joinedload` 预加载关联对象(避免N+1查询)
- 对常查询字段创建索引
- 分页查询限制单次返回数据量
- 使用数据库连接池(SQLAlchemy async pool)

### 前端性能优化
- 代码分割: React.lazy + dynamic import
- 图片优化: WebP格式, lazy loading
- 缓存策略: Service Worker (可选)
- 虚拟滚动: 大列表使用 react-virtual

### API性能优化
- 响应压缩(gzip)
- HTTP/2支持
- API响应缓存(Redis, 可选)
- 异步处理耗时操作(逾期检查用定时任务)

## 安全考虑

### 身份认证和授权
- JWT token认证
- 基于角色的访问控制(管理员/成员)
- 操作日志记录所有敏感操作

### 输入验证
- Pydantic schema验证所有API输入
- 前端表单验证(React Hook Form + Zod)
- 飞书文档URL白名单验证(feishu.cn, larksuite.com)

### 数据保护
- 密码bcrypt哈希存储
- HTTPS加密传输
- SQL注入防护(SQLAlchemy参数化查询)
- XSS防护(React自动转义)

### CORS配置
- 仅允许特定前端域名
- 禁止credentials=true的通配符域名

## 开发工具链

### 代码质量
- **Linter**: ESLint (前端), Ruff (后端)
- **Formatter**: Prettier (前端), Black (后端)
- **Type Checker**: TypeScript, mypy

### Git工作流
- Feature branches (001-ux-rescue-pm-system)
- Pull Request + Code Review
- 保护main分支,禁止直接push

### CI/CD (可选)
- GitHub Actions / GitLab CI
- 自动运行测试
- 自动部署到staging环境

## 风险和缓解

### 风险1: 飞书文档链接验证
- **风险**: 飞书可能更改域名或链接格式
- **缓解**: URL验证使用正则表达式,易于更新;记录所有验证失败日志

### 风险2: 逾期检查性能
- **风险**: 每日检查5000个任务可能影响性能
- **缓解**: 使用异步定时任务(APScheduler或Celery);只检查未完成的项目和任务

### 风险3: 数据库迁移
- **风险**: 生产环境迁移失败可能导致停机
- **缓解**: Alembic支持回滚;迁移前备份数据库;先在staging测试

## 总结

技术栈选择遵循以下原则:
1. **成熟度优先**: 选择经过生产验证的技术(React, FastAPI, PostgreSQL)
2. **增量交付**: 架构支持P1/P2/P3分阶段开发
3. **性能目标**: 满足规格要求(API < 500ms, 100并发用户)
4. **可维护性**: 清晰的项目结构,完善的文档和测试
5. **安全性**: 标准的认证授权,输入验证,数据保护

所有决策都基于规格说明的需求,无过度工程。

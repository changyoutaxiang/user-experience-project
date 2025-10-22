# API Contracts: 用户体验拯救项目群管理系统

**Date**: 2025-10-21
**Feature**: 001-ux-rescue-pm-system
**Purpose**: RESTful API 合约定义和使用说明

## Overview

本目录包含项目群管理系统的 API 合约文档。API 采用 RESTful 设计原则,使用 JSON 格式进行数据交换。

## API Documentation

完整的 OpenAPI 3.1 规范见 [openapi.yaml](openapi.yaml)

在线API文档将在开发环境自动生成:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Base URL

```
Development: http://localhost:8000/api/v1
Production: https://ux-rescue-pm.example.com/api/v1
```

## Authentication

所有需要认证的端点使用 JWT Bearer Token:

```http
Authorization: Bearer <access_token>
```

### 获取Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

## API Endpoints Summary

### 认证 (Authentication)
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/logout` - 用户登出
- `GET /api/v1/auth/me` - 获取当前用户信息

### 用户管理 (Users)
- `GET /api/v1/users` - 获取用户列表
- `POST /api/v1/users` - 创建用户 (管理员)
- `GET /api/v1/users/{user_id}` - 获取用户详情
- `PUT /api/v1/users/{user_id}` - 更新用户 (管理员)
- `DELETE /api/v1/users/{user_id}` - 删除用户 (管理员)

### 项目管理 (Projects)
- `GET /api/v1/projects` - 获取项目列表
- `POST /api/v1/projects` - 创建项目 (管理员/成员)
- `GET /api/v1/projects/{project_id}` - 获取项目详情
- `PUT /api/v1/projects/{project_id}` - 更新项目 (管理员)
- `DELETE /api/v1/projects/{project_id}` - 删除项目 (管理员)
- `POST /api/v1/projects/{project_id}/members` - 添加项目成员 (管理员)
- `DELETE /api/v1/projects/{project_id}/members/{user_id}` - 移除项目成员 (管理员)

### 任务管理 (Tasks)
- `GET /api/v1/projects/{project_id}/tasks` - 获取项目任务列表
- `POST /api/v1/projects/{project_id}/tasks` - 创建任务
- `GET /api/v1/tasks/{task_id}` - 获取任务详情
- `PUT /api/v1/tasks/{task_id}` - 更新任务
- `DELETE /api/v1/tasks/{task_id}` - 删除任务 (管理员)
- `GET /api/v1/my/tasks` - 获取当前用户的任务

### 预算管理 (Expenses)
- `GET /api/v1/projects/{project_id}/expenses` - 获取项目花费列表
- `POST /api/v1/projects/{project_id}/expenses` - 添加花费记录 (管理员)
- `DELETE /api/v1/expenses/{expense_id}` - 删除花费记录 (管理员)

### 文档管理 (Documents)
- `GET /api/v1/projects/{project_id}/documents` - 获取项目文档链接列表
- `POST /api/v1/projects/{project_id}/documents` - 添加项目文档链接
- `GET /api/v1/tasks/{task_id}/documents` - 获取任务文档链接列表
- `POST /api/v1/tasks/{task_id}/documents` - 添加任务文档链接
- `DELETE /api/v1/documents/{doc_id}` - 删除文档链接

### 仪表盘 (Dashboard)
- `GET /api/v1/dashboard` - 获取仪表盘数据
- `GET /api/v1/dashboard/stats` - 获取统计指标

### 操作日志 (Audit Logs)
- `GET /api/v1/audit-logs` - 获取操作日志 (管理员)

## Common Response Formats

### Success Response

```json
{
  "data": { ... },
  "message": "Success"
}
```

### Error Response

```json
{
  "detail": "Error message",
  "error_code": "ERROR_CODE"
}
```

### Paginated Response

```json
{
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

## HTTP Status Codes

- `200 OK` - 请求成功
- `201 Created` - 资源创建成功
- `204 No Content` - 删除成功
- `400 Bad Request` - 请求参数错误
- `401 Unauthorized` - 未认证
- `403 Forbidden` - 无权限
- `404 Not Found` - 资源不存在
- `422 Unprocessable Entity` - 验证失败
- `500 Internal Server Error` - 服务器错误

## Data Models (Schemas)

### User Schema
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "admin | member",
  "is_active": true,
  "created_at": "2025-10-21T12:00:00Z"
}
```

### Project Schema
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "status": "planning | in_progress | completed | archived",
  "budget_amount": 100000.00,
  "actual_spent": 30000.00,
  "budget_usage_rate": 30.0,
  "remaining_budget": 70000.00,
  "is_over_budget": false,
  "start_date": "2025-01-01",
  "planned_end_date": "2025-12-31",
  "is_overdue": false,
  "members": [{ "id": "uuid", "name": "string" }],
  "created_at": "2025-10-21T12:00:00Z",
  "updated_at": "2025-10-21T12:00:00Z"
}
```

### Task Schema
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "string",
  "description": "string | null",
  "status": "todo | in_progress | completed",
  "due_date": "2025-12-31 | null",
  "assigned_to": {
    "id": "uuid",
    "name": "string"
  } | null,
  "is_overdue": false,
  "created_at": "2025-10-21T12:00:00Z",
  "updated_at": "2025-10-21T12:00:00Z"
}
```

### Expense Schema
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "amount": 5000.00,
  "description": "设备采购",
  "recorded_at": "2025-10-21T12:00:00Z",
  "created_by": {
    "id": "uuid",
    "name": "string"
  }
}
```

### DocumentLink Schema
```json
{
  "id": "uuid",
  "url": "https://feishu.cn/docs/xxx",
  "title": "需求文档",
  "related_type": "project | task",
  "created_by": {
    "id": "uuid",
    "name": "string"
  },
  "created_at": "2025-10-21T12:00:00Z"
}
```

### Dashboard Schema
```json
{
  "total_projects": 100,
  "projects_by_status": {
    "planning": 20,
    "in_progress": 50,
    "completed": 25,
    "archived": 5
  },
  "total_budget": 10000000.00,
  "total_spent": 3500000.00,
  "budget_usage_rate": 35.0,
  "overdue_projects": 5,
  "overdue_tasks": 12,
  "total_tasks": 5000,
  "my_pending_tasks": 10
}
```

## Validation Rules

### Project Creation
- `name`: required, 1-200 characters
- `description`: optional, max 5000 characters
- `budget_amount`: optional, >= 0, default 0
- `start_date`: optional, ISO date format
- `planned_end_date`: optional, >= start_date

### Task Creation
- `name`: required, 1-200 characters
- `description`: optional, max 5000 characters
- `due_date`: optional, ISO date format
- `assigned_to`: optional, must be valid user_id
- `project_id`: required, must be valid project_id

### Expense Creation
- `amount`: required, > 0
- `description`: optional, max 500 characters
- `project_id`: required, must be valid project_id

### DocumentLink Creation
- `url`: required, must contain 'feishu.cn' or 'larksuite.com', max 500 characters
- `title`: optional, max 200 characters, default "相关文档"
- `related_project_id` or `related_task_id`: exactly one required

## Rate Limiting

暂无限流策略(内部系统)

## CORS Policy

允许的源:
- Development: `http://localhost:5173`, `http://localhost:3000`
- Production: `https://ux-rescue-pm.example.com`

## Changelog

### v1.0.0 (2025-10-21)
- Initial API design
- All CRUD endpoints for User, Project, Task, Expense, DocumentLink
- Dashboard and audit log endpoints
- JWT authentication

---

**Note**: 实际实现中,FastAPI将自动生成OpenAPI文档,此文档作为设计参考。

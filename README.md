# 用户体验拯救项目管理系统

一个全栈项目管理系统，用于管理项目、任务、支出和团队协作。采用规格驱动开发（Spec-Driven Development）方法构建。

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![CI](https://github.com/changyoutaxiang/user-experience-project/actions/workflows/ci.yml/badge.svg)
![Security](https://github.com/changyoutaxiang/user-experience-project/actions/workflows/security.yml/badge.svg)

## 📋 目录

- [项目概述](#项目概述)
- [主要功能](#主要功能)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [部署](#部署)
- [文档](#文档)
- [规格驱动开发](#规格驱动开发)

## 项目概述

用户体验拯救项目管理系统是一个现代化的全栈 Web 应用，旨在帮助团队有效管理项目、任务和资源。系统提供直观的用户界面、强大的数据分析和完整的审计追踪功能。

**核心特性**:
- 🔐 基于角色的访问控制（管理员/成员）
- 📊 实时项目统计和仪表板
- 📝 任务管理与优先级排序
- 💰 项目支出跟踪
- 📎 飞书文档集成
- 🔍 完整的审计日志
- 🌐 响应式设计，支持移动端

## 主要功能

### 用户管理
- JWT 令牌身份验证
- 基于角色的权限控制
- 用户注册和配置文件管理
- 管理员用户管理界面

### 项目管理
- 创建和更新项目
- 项目状态跟踪（规划中、进行中、已完成等）
- 预算管理和支出监控
- 团队成员分配
- 飞书文档链接

### 任务管理
- 创建和分配任务
- 优先级设置（高、中、低）
- 状态工作流（待办、进行中、已完成）
- 截止日期跟踪
- 个人任务看板

### 支出管理
- 记录项目支出
- 支出分类
- 预算使用分析
- 支出历史追踪

### 审计与分析
- 所有操作的审计日志
- 用户活动追踪
- 仪表板统计
- 项目进度报告

## 技术栈

### 后端
- **框架**: FastAPI 0.110.0
- **数据库**: PostgreSQL 15 with SQLAlchemy 2.0 (async)
- **身份验证**: JWT (python-jose)
- **数据验证**: Pydantic 2.6
- **迁移**: Alembic 1.13.1
- **服务器**: Uvicorn

### 前端
- **框架**: React 18.2
- **语言**: TypeScript 5.3
- **构建工具**: Vite 5.1
- **路由**: React Router DOM 6.22
- **状态管理**: Zustand 4.5
- **UI 组件**: Radix UI + Tailwind CSS 3.4
- **HTTP 客户端**: Axios 1.6

### DevOps
- **容器化**: Docker + Docker Compose
- **CI/CD**: Railway (planned)
- **代码质量**: Black, ESLint, Prettier
- **测试**: pytest, Vitest

## 快速开始

### 前置要求

- **Node.js** 18.x or higher
- **Python** 3.11 or higher
- **PostgreSQL** 15 or higher
- **Docker** and Docker Compose (可选，推荐)

### 使用 Docker Compose（推荐）

最简单的启动方式：

```bash
# 1. 克隆仓库
git clone <repository-url>
cd 用户体验拯救

# 2. 启动所有服务
docker-compose up -d

# 3. 等待服务就绪（约 30 秒）
docker-compose logs -f backend

# 4. 运行数据库迁移
docker exec ux-rescue-backend alembic upgrade head

# 5. 导入初始数据
docker exec ux-rescue-backend python -m src.utils.seed_data
```

应用现在运行在：
- **前端**: http://localhost:5173
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

**默认登录凭据**:
- **管理员**: admin@example.com / admin123456
- **成员**: zhangsan@example.com / password123

### 本地开发设置

#### 后端设置

```bash
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 DATABASE_URL 和 SECRET_KEY

# 5. 启动 PostgreSQL（如果未使用 Docker）
# 创建数据库: ux_rescue_pm

# 6. 运行迁移
alembic upgrade head

# 7. 导入初始数据
python -m src.utils.seed_data

# 8. 启动服务器
uvicorn src.api.main:app --reload
```

#### 前端设置

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 VITE_API_BASE_URL

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:5173 查看应用。

## 项目结构

```
用户体验拯救/
├── backend/                    # FastAPI 后端
│   ├── alembic/               # 数据库迁移
│   ├── src/
│   │   ├── api/              # API 路由和端点
│   │   ├── core/             # 核心配置和安全
│   │   ├── models/           # SQLAlchemy 模型
│   │   ├── schemas/          # Pydantic 模式
│   │   ├── services/         # 业务逻辑层
│   │   └── utils/            # 工具函数
│   ├── tests/                # 测试套件
│   └── requirements.txt      # Python 依赖
│
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── api/              # API 客户端
│   │   ├── components/       # React 组件
│   │   ├── pages/            # 页面组件
│   │   ├── store/            # Zustand 状态管理
│   │   ├── types/            # TypeScript 类型
│   │   ├── utils/            # 工具函数
│   │   └── routes/           # 路由配置
│   └── package.json          # Node.js 依赖
│
├── docker/                     # Docker 配置文件
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
│
├── specs/                      # 规格驱动开发文档
│   └── 001-ux-rescue-pm-system/
│       ├── spec.md           # 功能规格
│       ├── plan.md           # 实施计划
│       └── tasks.md          # 任务清单
│
├── .specify/                   # Spec Kit 配置
├── docker-compose.yml          # Docker Compose 配置
└── README.md                   # 本文件
```

## 开发指南

### 代码规范

**后端 (Python)**:
```bash
cd backend

# 格式化代码
black src tests
isort src tests

# 代码检查
flake8 src tests

# 类型检查
mypy src
```

**前端 (TypeScript)**:
```bash
cd frontend

# 代码检查
npm run lint

# 格式化
npm run format
```

### 运行测试

**后端**:
```bash
cd backend
pytest --cov=src
```

**前端**:
```bash
cd frontend
npm run test
```

### 数据库迁移

创建新的迁移：
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

### 添加新功能

1. 在 `specs/` 中更新规格文档
2. 在后端创建/更新模型和模式
3. 实现服务层业务逻辑
4. 创建 API 端点
5. 在前端创建 API 客户端
6. 实现 UI 组件
7. 添加路由和导航
8. 编写测试

## 部署

### 环境变量

**后端 (.env)**:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
SECRET_KEY=<your-secret-key>
ALLOWED_ORIGINS=https://your-frontend-domain.com
DEBUG=False
```

**前端 (.env)**:
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

### 生产构建

**后端**:
```bash
# 使用 Uvicorn 运行
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**前端**:
```bash
npm run build
# 将 dist/ 目录部署到静态托管服务
```

### Railway 部署

项目包含 Railway 部署配置文件：
- `backend/railway.toml`
- `frontend/railway.toml`

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录并部署
railway login
railway link
railway up
```

## 文档

- **[后端 README](backend/README.md)** - 后端 API 详细文档
- **[前端 README](frontend/README.md)** - 前端应用文档
- **[API 文档](http://localhost:8000/docs)** - Swagger UI（运行时可用）
- **[规格文档](specs/001-ux-rescue-pm-system/spec.md)** - 功能规格说明

## 规格驱动开发

本项目使用 [GitHub Spec Kit](https://github.com/github/spec-kit) 进行规格驱动开发（Spec-Driven Development）。

### Spec Kit 工作流程

1. **建立项目原则** - `/speckit.constitution`
   - 确立项目的指导原则和约束条件

2. **定义需求和用户故事** - `/speckit.specify`
   - 创建基准规格说明

3. **创建技术实施策略** - `/speckit.plan`
   - 制定实施计划

4. **生成可执行任务列表** - `/speckit.tasks`
   - 将计划转化为具体任务

5. **执行任务构建功能** - `/speckit.implement`
   - 实施具体任务

### 可选增强命令

- **`/speckit.clarify`** - 在规划前提出结构化问题以降低歧义风险
- **`/speckit.analyze`** - 跨制品一致性和对齐报告
- **`/speckit.checklist`** - 生成质量检查清单

### 规格文档结构

```
specs/001-ux-rescue-pm-system/
├── spec.md      # 功能规格和用户故事
├── plan.md      # 技术实施计划
├── tasks.md     # 详细任务清单（125 个任务）
└── ...          # 其他规格文档
```

## 安全注意事项

⚠️ **重要提示**:

- `.claude/` 目录包含敏感信息，已在 `.gitignore` 中排除
- 在生产环境中更改默认的 `SECRET_KEY`
- 使用环境变量管理敏感配置
- 启用 HTTPS/SSL 证书
- 定期更新依赖包
- 遵循最小权限原则

## 常见问题

### 端口已被占用

```bash
# 查找占用端口的进程
lsof -i :8000  # 后端
lsof -i :5173  # 前端

# 终止进程
kill -9 <PID>
```

### 数据库连接问题

```bash
# 检查 PostgreSQL 是否运行
psql -U postgres -c "SELECT version();"

# 测试数据库连接
psql postgresql://postgres:postgres@localhost:5432/ux_rescue_pm
```

### Docker 问题

```bash
# 重新构建容器
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

Proprietary - All rights reserved

## 联系方式

如有问题或建议，请联系开发团队。

---

**最后更新**: 2024-01-15
**项目状态**: 活跃开发中
**进度**: Phase 8 - 波兰和跨领域关注 (116/125 任务完成)

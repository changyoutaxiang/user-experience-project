# Quickstart Guide: 用户体验拯救项目群管理系统

**Date**: 2025-10-21
**Feature**: 001-ux-rescue-pm-system
**Purpose**: 快速搭建开发环境并启动项目

## Prerequisites

确保您的开发环境已安装以下工具:

### 必需工具
- **Git**: 2.30+
- **Python**: 3.11+ (后端)
- **Node.js**: 20.x LTS (前端)
- **PostgreSQL**: 15+ (数据库)
- **Docker** (可选): 用于容器化部署

### 可选工具
- **uv**: Python包管理器(推荐,比pip更快)
- **pnpm**: 替代npm的包管理器(可选)
- **Docker Compose**: 一键启动所有服务

## Quick Start (Docker Compose - 推荐)

最快的方式是使用Docker Compose启动所有服务:

```bash
# 1. Clone repository
git checkout 001-ux-rescue-pm-system

# 2. Copy environment variables
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Initialize database
docker-compose exec backend alembic upgrade head

# 5. Create admin user (optional)
docker-compose exec backend python -m src.scripts.create_admin

# 6. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

就这样!应用已经运行了。

## Manual Setup (本地开发)

如果您想在本地运行而不使用Docker:

### 1. 数据库设置

```bash
# 启动PostgreSQL (macOS)
brew services start postgresql@15

# 或使用Docker运行PostgreSQL
docker run -d \
  --name ux-rescue-postgres \
  -e POSTGRES_DB=ux_rescue_pm \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# 创建数据库
createdb ux_rescue_pm

# 或使用psql
psql -U postgres -c "CREATE DATABASE ux_rescue_pm;"
```

### 2. 后端设置 (Python + FastAPI)

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python3.11 -m venv venv
source venv/bin/activate  # Linux/macOS
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 或使用uv (更快)
uv pip install -r requirements.txt

# 配置环境变量
cp ../.env.example ../.env
# 编辑 .env 文件,设置数据库连接等

# 运行数据库迁移
alembic upgrade head

# 创建初始管理员用户
python -m src.scripts.create_admin \
  --name "管理员" \
  --email "admin@example.com" \
  --password "admin123"

# 启动后端服务
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000

# 后端现在运行在 http://localhost:8000
# API文档: http://localhost:8000/docs
```

### 3. 前端设置 (TypeScript + React)

```bash
# 打开新终端,进入前端目录
cd frontend

# 安装依赖
npm install
# 或使用pnpm (更快)
pnpm install

# 配置环境变量 (如果需要)
cp .env.example .env.local

# 启动开发服务器
npm run dev
# 或 pnpm dev

# 前端现在运行在 http://localhost:5173
```

### 4. 访问应用

打开浏览器访问:
- **前端**: http://localhost:5173
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

### 5. 默认登录

如果您运行了创建管理员脚本:
- Email: `admin@example.com`
- Password: `admin123`

## 环境变量配置

### 后端 (.env)

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ux_rescue_pm

# Security
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Environment
ENVIRONMENT=development
DEBUG=true
```

### 前端 (.env.local)

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 运行测试

### 后端测试

```bash
cd backend

# 运行所有测试
pytest

# 运行特定测试
pytest tests/contract/test_projects_api.py

# 运行测试并查看覆盖率
pytest --cov=src --cov-report=html

# 打开覆盖率报告
open htmlcov/index.html  # macOS
```

### 前端测试

```bash
cd frontend

# 运行单元测试
npm test
# 或 pnpm test

# 运行测试并查看覆盖率
npm run test:coverage
```

## 开发工作流

### 1. 创建新功能分支

```bash
git checkout -b feature/your-feature-name
```

### 2. 数据库迁移 (如果需要修改模型)

```bash
cd backend

# 创建新迁移
alembic revision --autogenerate -m "Add new field to project"

# 查看迁移SQL
alembic upgrade head --sql

# 应用迁移
alembic upgrade head

# 回滚迁移 (如果需要)
alembic downgrade -1
```

### 3. 添加新API端点

1. 在 `backend/src/models/` 添加/修改模型
2. 在 `backend/src/schemas/` 添加Pydantic schemas
3. 在 `backend/src/services/` 添加业务逻辑
4. 在 `backend/src/api/routes/` 添加路由处理
5. 在 `backend/tests/contract/` 添加API测试
6. 运行测试确保通过

### 4. 添加新前端组件

1. 在 `frontend/src/components/` 创建组件
2. 在 `frontend/src/services/` 添加API调用
3. 在 `frontend/src/pages/` 集成到页面
4. 添加路由 (如果需要)
5. 运行测试

### 5. 提交代码

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

## 常见问题

### 数据库连接失败

**问题**: `connection refused` 或 `role does not exist`

**解决**:
```bash
# 检查PostgreSQL是否运行
pg_isready

# 检查数据库是否存在
psql -l | grep ux_rescue_pm

# 创建数据库 (如果不存在)
createdb ux_rescue_pm
```

### 后端依赖安装失败

**问题**: `pip install` 失败

**解决**:
```bash
# 升级pip
pip install --upgrade pip

# 或使用uv (推荐)
pip install uv
uv pip install -r requirements.txt
```

### 前端编译错误

**问题**: TypeScript类型错误

**解决**:
```bash
# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install

# 或清理缓存
npm cache clean --force
npm install
```

### 端口冲突

**问题**: `Address already in use`

**解决**:
```bash
# 查找占用端口的进程 (macOS/Linux)
lsof -i :8000  # 后端
lsof -i :5173  # 前端

# 杀死进程
kill -9 <PID>

# 或使用不同端口
uvicorn src.api.main:app --port 8001
npm run dev -- --port 5174
```

## 生产部署

### Railway 部署 (推荐)

Railway 提供零配置的自动部署,适合快速上线。

#### 1. 准备工作

```bash
# 确保代码已推送到 GitHub
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

#### 2. 创建 Railway 配置文件

**后端 railway.toml** (在 `backend/` 目录):
```toml
[build]
builder = "nixpacks"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "alembic upgrade head && uvicorn src.api.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/api/v1/health"
healthcheckTimeout = 10
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 3
```

**前端 railway.toml** (在 `frontend/` 目录):
```toml
[build]
builder = "nixpacks"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run preview -- --port $PORT --host 0.0.0.0"
```

#### 3. Railway 部署步骤

1. **登录 Railway**: 访问 https://railway.app 并登录
2. **创建新项目**:
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 授权并选择您的仓库
3. **添加 PostgreSQL**:
   - 在项目中点击 "+ New"
   - 选择 "Database" → "PostgreSQL"
   - Railway 自动创建数据库并设置 `DATABASE_URL`
4. **配置后端服务**:
   - 点击 "+ New" → "GitHub Repo"
   - 选择 `backend/` 作为根目录
   - 添加环境变量:
     ```
     DATABASE_URL=${PostgreSQL.DATABASE_URL}
     SECRET_KEY=<生成一个强随机密钥>
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=15
     ALLOWED_ORIGINS=https://<frontend-url>.railway.app
     ENVIRONMENT=production
     DEBUG=false
     ```
5. **配置前端服务**:
   - 点击 "+ New" → "GitHub Repo"
   - 选择 `frontend/` 作为根目录
   - 添加环境变量:
     ```
     VITE_API_BASE_URL=https://<backend-url>.railway.app/api/v1
     ```
6. **部署**: Railway 自动检测到配置文件并开始部署

#### 4. 获取服务 URL

部署成功后,Railway 会为每个服务生成唯一 URL:
- Backend: `https://ux-rescue-backend.railway.app`
- Frontend: `https://ux-rescue-frontend.railway.app`

#### 5. 配置自定义域名 (可选)

在 Railway 项目设置中:
- Settings → Domains
- 添加自定义域名并配置 DNS

#### 6. 自动部署

Railway 已自动配置 GitHub webhook:
- Push 到 `main` 分支 → 自动部署到生产
- 创建 Pull Request → 自动创建预览环境

#### 7. 初始化数据

部署成功后,创建管理员用户:
```bash
# 使用 Railway CLI (本地)
railway login
railway link
railway run python -m src.scripts.create_admin --name "管理员" --email "admin@example.com" --password "secure-password"
```

### Docker 部署 (自托管)

如果您需要自托管,可以使用 Docker:

```bash
# 构建镜像
docker-compose -f docker-compose.prod.yml build

# 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 定时任务 (逾期检查)

设置每日凌晨检查逾期项目和任务:

```bash
# 使用cron (Linux/macOS)
crontab -e

# 添加以下行 (每天凌晨1点运行)
0 1 * * * cd /path/to/backend && python -m src.scripts.check_overdue
```

或使用 APScheduler (推荐):
- 已集成在 `backend/src/services/overdue_checker.py`
- 随后端服务自动启动

## 下一步

- 阅读 [spec.md](spec.md) 了解功能需求
- 查看 [data-model.md](data-model.md) 了解数据模型
- 参考 [contracts/README.md](contracts/README.md) 了解API设计
- 运行 `/speckit.tasks` 生成任务列表并开始实施

## 获取帮助

- **Bug报告**: 创建 GitHub Issue
- **功能请求**: 提交 Pull Request
- **文档问题**: 更新相应的 .md 文件

---

**Last Updated**: 2025-10-21

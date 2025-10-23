# 开发指南

本文档提供项目开发的工具、最佳实践和常用命令。

---

## 🛠️ 开发工具

### 必需工具

| 工具 | 版本 | 用途 |
|------|------|------|
| Python | 3.11+ | 后端开发 |
| Node.js | 18+ | 前端开发 |
| PostgreSQL | 15+ | 数据库 |
| Docker | 最新 | 容器化 |
| Git | 最新 | 版本控制 |

### 推荐工具

- **IDE**: VS Code, PyCharm, WebStorm
- **API测试**: Postman, HTTPie, curl
- **数据库管理**: pgAdmin, DBeaver
- **Git GUI**: GitHub Desktop, GitKraken

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/changyoutaxiang/user-experience-project.git
cd user-experience-project
```

### 2. 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 DATABASE_URL 和 SECRET_KEY

# 运行数据库迁移
alembic upgrade head

# (可选) 加载种子数据
python -m src.utils.seed_data

# 启动开发服务器
uvicorn src.api.main:app --reload
```

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 启动开发服务器
npm run dev
```

### 4. Docker 设置（可选）

```bash
# 开发环境
docker-compose up

# 生产环境
docker-compose -f docker-compose.prod.yml up
```

---

## 📝 常用命令

### 后端命令

```bash
# 启动开发服务器
uvicorn src.api.main:app --reload --port 8000

# 代码格式化
black src/
isort src/

# 类型检查
mypy src/

# 运行测试
pytest tests/ -v

# 测试覆盖率
pytest tests/ --cov=src --cov-report=html

# 数据库迁移
alembic revision --autogenerate -m "描述"
alembic upgrade head
alembic downgrade -1

# 数据库备份
./scripts/backup-db.sh

# 数据库恢复
./scripts/restore-db.sh ./backups/ux_rescue_20251023_120000.sql.gz
```

### 前端命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format

# 运行测试
npm run test

# 测试覆盖率
npm run test:coverage

# 测试 UI 模式
npm run test:ui
```

### Docker 命令

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up

# 后台运行
docker-compose up -d

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 停止服务
docker-compose down

# 重建并启动
docker-compose up --build

# 进入容器
docker-compose exec backend bash
docker-compose exec frontend sh
```

---

## 🎯 开发工作流

### 功能开发流程

1. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **开发和测试**
   - 编写代码
   - 添加测试
   - 运行测试确保通过
   - 代码格式化和检查

3. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加XXX功能"
   ```

4. **推送并创建 PR**
   ```bash
   git push origin feature/your-feature-name
   # 在 GitHub 创建 Pull Request
   ```

5. **代码审查和合并**
   - 等待 CI/CD 通过
   - 代码审查
   - 合并到 main

### Commit 消息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）**:
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:
```bash
git commit -m "feat(auth): 添加 JWT 认证功能"
git commit -m "fix(api): 修复项目列表分页问题"
git commit -m "docs: 更新 README 安装说明"
```

---

## 🧪 测试指南

### 后端测试

**单元测试**:
```python
# tests/test_example.py
import pytest

def test_example():
    assert 1 + 1 == 2
```

**API 测试**:
```python
@pytest.mark.asyncio
async def test_login(client):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "password"}
    )
    assert response.status_code == 200
```

**运行特定测试**:
```bash
pytest tests/test_auth.py -v
pytest tests/test_auth.py::test_login -v
pytest -k "auth" -v  # 运行所有包含 auth 的测试
```

### 前端测试

**组件测试**:
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

**运行特定测试**:
```bash
npm run test -- Button.test.tsx
npm run test -- --watch
```

---

## 🐛 调试技巧

### 后端调试

**使用 pdb**:
```python
import pdb; pdb.set_trace()  # 设置断点
```

**查看日志**:
```bash
# 应用日志
tail -f backend/logs/app.log

# Docker 日志
docker-compose logs -f backend
```

**数据库查询**:
```bash
# 连接到数据库
psql $DATABASE_URL

# 查看表
\dt

# 查询数据
SELECT * FROM users LIMIT 10;
```

### 前端调试

**浏览器 DevTools**:
- Console: 查看日志
- Network: 查看 API 请求
- React DevTools: 查看组件状态

**Vite 调试**:
```bash
# 查看详细输出
npm run dev -- --debug
```

---

## 🔧 环境配置

### 后端环境变量

```bash
# 开发环境 (.env)
ENVIRONMENT=development
DEBUG=True
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ux_rescue_pm
SECRET_KEY=dev-secret-key-change-me
ALLOWED_ORIGINS=http://localhost:5173
```

### 前端环境变量

```bash
# 开发环境 (.env)
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📊 性能优化

### 后端优化

1. **数据库查询优化**
   ```python
   # 使用 joinedload 预加载关联
   projects = await session.execute(
       select(Project).options(joinedload(Project.members))
   )
   ```

2. **响应压缩**
   - 已启用 GZip 压缩（>1KB）

3. **API 缓存**（待实现）
   - Redis 缓存常用查询

### 前端优化

1. **代码分割**
   - 已配置 Vite 自动分包

2. **懒加载**
   ```typescript
   const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
   ```

3. **图片优化**
   - 使用 WebP 格式
   - 添加 `loading="lazy"`

---

## 🚨 故障排查

### 常见问题

**1. 数据库连接失败**
```bash
# 检查 PostgreSQL 是否运行
pg_isready

# 检查连接字符串
echo $DATABASE_URL

# 重启数据库
docker-compose restart postgres
```

**2. 前端无法连接后端**
```bash
# 检查后端是否运行
curl http://localhost:8000/health

# 检查 CORS 配置
# backend/src/core/config.py: ALLOWED_ORIGINS
```

**3. Docker 构建失败**
```bash
# 清理并重建
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

**4. 测试失败**
```bash
# 清理测试缓存
pytest --cache-clear

# 重新安装依赖
pip install -r requirements.txt --force-reinstall
```

---

## 📚 相关资源

### 文档
- [README.md](README.md) - 项目概述
- [SECURITY.md](SECURITY.md) - 安全策略
- [SECURITY_SETUP.md](SECURITY_SETUP.md) - 安全配置
- [优化修复规划.md](优化修复规划.md) - 优化计划

### API 文档
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 技术文档
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [PostgreSQL](https://www.postgresql.org/docs/)

---

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 推送到分支
5. 创建 Pull Request

详见 Pull Request 模板（待添加）。

---

**最后更新**: 2025-10-23

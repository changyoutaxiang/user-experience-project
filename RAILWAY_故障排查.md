# Railway 部署故障排查指南

## 🚨 错误: "Error creating build plan with Railpack"

### 问题原因

这是 **monorepo 项目结构** 导致的常见问题：
- 项目有多个子目录（`backend/` 和 `frontend/`）
- Railway 不知道该为每个服务使用哪个目录
- 配置文件在子目录中，而不是根目录

### ✅ 解决方案 1: 设置 Root Directory（推荐）

#### Backend 服务配置

1. **打开 Railway Dashboard** → 选择你的项目
2. **点击 backend 服务卡片**
3. **进入 Settings 标签**
4. **找到 "Service Settings" 或 "Source" 部分**
5. **设置 Root Directory**:
   ```
   backend
   ```
   或
   ```
   /backend
   ```
6. **保存设置**
7. **返回 Deployments 标签 → 点击 "Redeploy"**

#### Frontend 服务配置

1. **返回项目主页**
2. **点击 frontend 服务卡片**
3. **进入 Settings 标签**
4. **设置 Root Directory**:
   ```
   frontend
   ```
   或
   ```
   /frontend
   ```
5. **保存设置**
6. **Deployments → Redeploy**

#### 验证配置

部署前检查：
- ✅ Backend Root Directory = `/backend`
- ✅ Frontend Root Directory = `/frontend`
- ✅ Builder = Nixpacks (应该自动设置)

---

### ✅ 解决方案 2: 删除并重新创建服务

如果设置 Root Directory 后仍然失败，尝试重新创建：

#### 步骤 1: 删除现有服务

1. **Backend 服务** → **Settings** → 滚动到底部 → **"Delete Service"**
2. **Frontend 服务** → **Settings** → **"Delete Service"**
3. **保留 PostgreSQL 数据库**（不要删除）

#### 步骤 2: 手动添加 Backend 服务

1. **项目主页** → **"New"** → **"Empty Service"**
2. **命名**: `backend`
3. **Settings**:
   - **Source**: 选择你的 GitHub 仓库
   - **Branch**: `main`
   - **Root Directory**: `/backend`
   - **Build Command**: 留空（Nixpacks 自动处理）
   - **Start Command**: 留空（使用 nixpacks.toml 中的配置）

4. **Variables** 标签添加环境变量:
   ```bash
   DATABASE_URL=postgresql+asyncpg://...  # 从 Postgres 服务复制
   SECRET_KEY=<生成64位随机字符串>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DEBUG=False
   ALLOWED_ORIGINS=  # 暂时留空
   ```

5. **Settings → Networking → Generate Domain**

6. **Deployments → Deploy**

#### 步骤 3: 手动添加 Frontend 服务

1. **项目主页** → **"New"** → **"Empty Service"**
2. **命名**: `frontend`
3. **Settings**:
   - **Source**: 选择你的 GitHub 仓库
   - **Branch**: `main`
   - **Root Directory**: `/frontend`

4. **Variables** 标签:
   ```bash
   VITE_API_BASE_URL=<后端域名>
   ```

5. **Settings → Networking → Generate Domain**

6. **Deployments → Deploy**

---

### ✅ 解决方案 3: 使用 Railway CLI（高级用户）

如果你愿意使用命令行：

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 或使用 Homebrew (macOS)
brew install railway

# 2. 登录
railway login

# 3. 在项目根目录
cd /Users/wangdong/Desktop/用户体验拯救

# 4. 链接到现有项目
railway link

# 5. 部署 Backend
cd backend
railway up

# 6. 部署 Frontend
cd ../frontend
railway up
```

**注意**: CLI 方式仍然需要在 Railway Dashboard 中配置环境变量和域名。

---

### ✅ 解决方案 4: 简化项目结构（不推荐）

**最后手段**：如果上述所有方法都失败，可以考虑分离仓库：

1. 创建两个独立仓库：
   - `user-experience-backend`
   - `user-experience-frontend`

2. 在 Railway 中分别部署

**缺点**:
- 失去 monorepo 的优势
- 维护更复杂
- 不推荐使用

---

## 🔍 验证部署是否成功

### 检查 1: 查看构建日志

**Backend**:
1. Deployments → 点击最新部署
2. **Build Logs** 应该显示:
   ```
   Installing python311
   Installing postgresql
   pip install -r requirements.txt
   Successfully installed ...
   ```

3. **Deploy Logs** 应该显示:
   ```
   Running Alembic migrations...
   INFO  [alembic.runtime.migration] Running upgrade
   Application startup complete
   Uvicorn running on http://0.0.0.0:xxxx
   ```

**Frontend**:
1. Deployments → 点击最新部署
2. **Build Logs** 应该显示:
   ```
   Installing nodejs-18_x
   npm ci
   npm run build
   dist/ created
   ```

3. **Deploy Logs** 应该显示:
   ```
   npm run preview
   Local: http://localhost:xxxx/
   ```

### 检查 2: 测试健康端点

```bash
# 后端健康检查
curl https://<backend-domain>.railway.app/health

# 应返回
{"status":"healthy","app":"用户体验拯救项目管理系统"}

# 前端
curl https://<frontend-domain>.railway.app/

# 应返回 HTML 内容
```

---

## 📋 常见错误和解决方法

### 错误 1: "No build command found"

**原因**: nixpacks.toml 未被识别

**解决**:
1. 确认 Root Directory 设置正确
2. 确认 nixpacks.toml 文件存在于正确的目录
3. 检查文件名拼写（不是 nixpack.toml）

---

### 错误 2: "Cannot find module 'requirements.txt'"

**原因**: Railway 在错误的目录查找文件

**解决**:
- 设置 Root Directory = `/backend`

---

### 错误 3: "Build succeeded but deployment failed"

**原因**: 启动命令错误或环境变量缺失

**解决**:
1. 检查所有必需的环境变量已设置
2. 查看 Deploy Logs 找到具体错误
3. 确认 DATABASE_URL 格式正确（postgresql+asyncpg://）

---

### 错误 4: "Port already in use"

**原因**: 启动命令未使用 $PORT 环境变量

**解决**:
- 确认 start command 包含 `--port $PORT`
- nixpacks.toml 中应该有:
  ```toml
  cmd = 'uvicorn src.api.main:app --host 0.0.0.0 --port $PORT'
  ```

---

## 🎯 推荐部署流程

按这个顺序操作成功率最高：

1. ✅ **创建 PostgreSQL 数据库**
2. ✅ **配置 Backend**:
   - 设置 Root Directory: `/backend`
   - 添加环境变量（包括 DATABASE_URL）
   - 生成域名
   - 部署
3. ✅ **配置 Frontend**:
   - 设置 Root Directory: `/frontend`
   - 添加环境变量（VITE_API_BASE_URL = 后端域名）
   - 生成域名
   - 部署
4. ✅ **更新 Backend CORS**:
   - 设置 ALLOWED_ORIGINS = 前端域名
   - 重新部署 Backend
5. ✅ **验证**:
   - 测试 /health 端点
   - 访问前端页面
   - 测试登录功能

---

## 💡 最佳实践

### 使用 Watch Paths

在 Settings 中设置 Watch Paths，避免不必要的重新部署：

**Backend**:
```
backend/**
```

**Frontend**:
```
frontend/**
```

### 环境变量管理

1. **使用 Railway Variables 功能**，不要硬编码
2. **为不同环境创建不同的项目**（Development, Staging, Production）
3. **定期轮换 SECRET_KEY**

### 监控和日志

1. **启用健康检查**（已在 railway.toml 中配置）
2. **定期查看 Deploy Logs**
3. **使用 Railway 的 Metrics 功能监控资源使用**

---

## 📞 获取帮助

如果以上方法都不起作用：

1. **检查 Railway 状态页**: https://railway.app/status
2. **查看 Railway 文档**: https://docs.railway.app
3. **Railway Discord**: https://discord.gg/railway
4. **GitHub Issues**: https://github.com/railwayapp/railway/issues

---

## 🔧 调试命令

### 本地测试 Nixpacks

```bash
# 安装 Nixpacks
curl -sSL https://nixpacks.com/install.sh | bash

# 在 backend 目录测试构建
cd backend
nixpacks build . --name backend

# 在 frontend 目录测试构建
cd frontend
nixpacks build . --name frontend
```

### 检查配置文件

```bash
# 验证 TOML 语法
cd backend
cat railway.toml
cat nixpacks.toml

cd ../frontend
cat railway.toml
cat nixpacks.toml
```

---

**最后更新**: 2025-10-23
**适用于**: Railway Hobby Plan
**项目**: 用户体验拯救项目管理系统

# Supabase + Vercel 部署指南

## 📋 部署概览

本指南将帮助您将**用户体验拯救项目管理系统**从 Railway 迁移到 Supabase + Vercel。

**架构**：
- **数据库**: Supabase PostgreSQL ✅ (已创建)
- **后端**: Vercel Serverless Functions (FastAPI)
- **前端**: Vercel Static Hosting (React + Vite)

**预计时间**: 30-45 分钟

---

## 🎯 第一步：配置 Supabase 数据库

### 1.1 获取数据库连接信息

您的 Supabase 项目信息：
```
Project URL: https://djgmecfoecjkfqhieavg.supabase.co
Project ID: djgmecfoecjkfqhieavg
```

**获取数据库密码和连接字符串**：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目 `djgmecfoecjkfqhieavg`
3. 进入 **Project Settings** (左下角齿轮图标) > **Database**
4. 在 **Database Settings** 页面找到 **Database Password** - 如果忘记密码，点击 **Reset database password** 重置
5. 在 **Connection string** 部分：
   - 选择 **URI** 标签
   - 勾选 **Use connection pooling** (推荐，提高性能)
   - 复制连接字符串，格式如下：
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - 将 `[YOUR-PASSWORD]` 替换为您的实际数据库密码

### 1.2 执行数据库迁移

1. 在 Supabase Dashboard 中，进入 **SQL Editor** (左侧菜单)
2. 点击 **New query**
3. 打开项目根目录的 `supabase-migration.sql` 文件
4. 复制所有 SQL 内容并粘贴到 SQL Editor
5. 点击 **Run** 执行迁移（预计耗时 5-10 秒）
6. 如果成功，您应该看到 "Success. No rows returned" 消息

### 1.3 验证数据库

在 SQL Editor 中运行以下查询验证表已创建：

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

您应该看到以下表：
- `users`
- `audit_logs`
- `projects`
- `project_members`
- `tasks`
- `document_links`
- `expenses`

---

## 🚀 第二步：部署后端到 Vercel

### 2.1 准备后端代码

后端需要进行一些调整以适配 Vercel Serverless Functions：

**选项 A：使用 Vercel (推荐用于简单应用)**

1. 在 `backend` 目录确认已有 `vercel.json` 配置文件 ✅
2. 创建 `backend/requirements.txt` 确保包含所有依赖 ✅

**选项 B：使用 Render/Fly.io (推荐用于复杂应用)**

如果您的后端较复杂或需要长时间运行的进程，建议使用 Render 或 Fly.io 部署。

### 2.2 在 Vercel 部署后端

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Add New** > **Project**
3. 导入您的 GitHub 仓库
4. 在项目配置中：
   - **Framework Preset**: 选择 **Other**
   - **Root Directory**: 设置为 `backend`
   - **Build Command**: 留空
   - **Output Directory**: 留空
   - **Install Command**: `pip install -r requirements.txt`

5. 配置环境变量（点击 **Environment Variables**）：

```env
APP_NAME=用户体验拯救项目群管理系统
DEBUG=False
DATABASE_URL=<粘贴您从 Supabase 获取的完整数据库连接字符串>
SECRET_KEY=b0c1ac5c1a5a92aa98ad9179f2f1e042eaaf7746cddcce7895a920e76f6da354
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://your-frontend.vercel.app
SUPABASE_URL=https://djgmecfoecjkfqhieavg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ21lY2ZvZWNqa2ZxaGllYXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTgyNDUsImV4cCI6MjA3Njg5NDI0NX0.m8bJgCTru7hep9Y_raoM7CFVii4vRdTn8g-Cb8Dxin0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ21lY2ZvZWNqa2ZxaGllYXZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMxODI0NSwiZXhwIjoyMDc2ODk0MjQ1fQ.-UnVkwF0gU_tSTRp8laCP9BfiWtemXmCpUKFx6BSINM
```

6. 点击 **Deploy** 开始部署

7. 部署完成后，您会获得一个后端 URL，类似：
   ```
   https://your-backend-xxx.vercel.app
   ```

8. **重要**：记录这个 URL，稍后前端需要使用！

### 2.3 测试后端

访问以下 URL 测试后端是否正常：

```
https://your-backend-xxx.vercel.app/docs
```

如果看到 FastAPI 的 Swagger UI 文档页面，说明后端部署成功！

---

## 🎨 第三步：部署前端到 Vercel

### 3.1 更新前端配置

在部署前端之前，需要先更新环境变量：

编辑 `frontend/.env.production`：

```env
VITE_API_BASE_URL=https://your-backend-xxx.vercel.app
VITE_DEBUG=false
VITE_SUPABASE_URL=https://djgmecfoecjkfqhieavg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ21lY2ZvZWNqa2ZxaGllYXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTgyNDUsImV4cCI6MjA3Njg5NDI0NX0.m8bJgCTru7hep9Y_raoM7CFVii4vRdTn8g-Cb8Dxin0
```

### 3.2 在 Vercel 部署前端

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Add New** > **Project**
3. 选择同一个 GitHub 仓库（或创建新的）
4. 在项目配置中：
   - **Framework Preset**: 自动检测为 **Vite**
   - **Root Directory**: 设置为 `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. 配置环境变量：

```env
VITE_API_BASE_URL=https://your-backend-xxx.vercel.app
VITE_DEBUG=false
VITE_SUPABASE_URL=https://djgmecfoecjkfqhieavg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ21lY2ZvZWNqa2ZxaGllYXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTgyNDUsImV4cCI6MjA3Njg5NDI0NX0.m8bJgCTru7hep9Y_raoM7CFVii4vRdTn8g-Cb8Dxin0
```

6. 点击 **Deploy**

7. 部署完成后，您会获得前端 URL：
   ```
   https://your-frontend-xxx.vercel.app
   ```

### 3.3 更新后端 CORS 设置

现在您有了前端 URL，需要更新后端的 CORS 配置：

1. 回到 Vercel Dashboard 中的后端项目
2. 进入 **Settings** > **Environment Variables**
3. 编辑 `ALLOWED_ORIGINS` 变量：
   ```
   https://your-frontend-xxx.vercel.app
   ```
4. 保存后，点击 **Deployments** 标签页
5. 找到最新的部署，点击右侧的三个点 > **Redeploy**

---

## ✅ 第四步：验证部署

### 4.1 测试应用

1. 访问您的前端 URL：`https://your-frontend-xxx.vercel.app`
2. 使用默认账号登录：
   - **邮箱**: `admin@example.com`
   - **密码**: `admin123456`

3. 测试核心功能：
   - ✅ 用户登录
   - ✅ 创建项目
   - ✅ 创建任务
   - ✅ 添加支出
   - ✅ 查看仪表板

### 4.2 检查日志

如果遇到问题：

**后端日志**：
1. Vercel Dashboard > 选择后端项目 > **Deployments**
2. 点击最新部署 > **View Function Logs**

**前端日志**：
1. 浏览器按 F12 打开开发者工具
2. 查看 Console 和 Network 标签

**数据库日志**：
1. Supabase Dashboard > **Logs** > **Database**

---

## 🔧 常见问题排查

### 问题 1: 后端 500 错误

**原因**: 数据库连接失败

**解决**:
1. 检查 Vercel 后端环境变量中的 `DATABASE_URL` 是否正确
2. 确保使用了 connection pooling 的连接字符串（端口 6543）
3. 在 Supabase Dashboard 检查数据库是否正常运行

### 问题 2: CORS 错误

**原因**: 后端未允许前端域名

**解决**:
1. 检查后端 `ALLOWED_ORIGINS` 环境变量
2. 确保包含正确的前端 Vercel URL
3. 重新部署后端

### 问题 3: 前端无法连接后端

**原因**: API URL 配置错误

**解决**:
1. 检查前端 `VITE_API_BASE_URL` 环境变量
2. 确保后端 URL 正确（不要在末尾加 `/`）
3. 在浏览器开发者工具检查实际请求的 URL

### 问题 4: Vercel 部署 Python 后端超时

**原因**: Vercel Serverless Functions 有执行时间限制（10 秒免费版，60 秒专业版）

**解决**:
- 考虑使用 Render 或 Fly.io 部署后端
- 优化数据库查询
- 升级到 Vercel Pro 计划

---

## 📚 备选方案：使用 Render 部署后端

如果 Vercel 部署后端遇到问题，推荐使用 Render：

### Render 部署步骤

1. 访问 [Render Dashboard](https://dashboard.render.com/)
2. 点击 **New** > **Web Service**
3. 连接 GitHub 仓库
4. 配置：
   - **Name**: `ux-rescue-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.api.main:app --host 0.0.0.0 --port $PORT`

5. 添加环境变量（同 Vercel）

6. 点击 **Create Web Service**

7. 部署完成后，使用 Render 提供的 URL 更新前端配置

---

## 🎉 完成！

恭喜！您已成功将项目迁移到 Supabase + Vercel！

**后续优化建议**：

1. **安全性**：
   - 在 Supabase 启用 Row Level Security (RLS)
   - 定期轮换 SECRET_KEY 和数据库密码
   - 设置 Supabase 备份策略

2. **性能**：
   - 启用 Vercel Edge Functions（如适用）
   - 配置 CDN 缓存策略
   - 监控 Supabase 数据库性能

3. **监控**：
   - 设置 Vercel Analytics
   - 配置错误日志追踪（如 Sentry）
   - 启用 Supabase 日志监控

4. **自定义域名**：
   - 在 Vercel 添加自定义域名
   - 配置 SSL 证书（自动）

---

## 📞 需要帮助？

如果遇到问题，请检查：

- [Supabase 文档](https://supabase.com/docs)
- [Vercel 文档](https://vercel.com/docs)
- 项目 GitHub Issues

---

**最后更新**: 2024-10-24

# 🚀 快速开始 - Supabase 部署

## ✅ 已完成的工作

- ✅ Supabase 数据库已创建
- ✅ 数据库表结构已迁移
- ✅ 环境变量已配置
- ✅ 数据库连接字符串已设置

---

## 📍 当前进度

您现在位于：**第一步完成** ✅

接下来需要：
1. 测试本地后端连接
2. 部署后端到 Vercel
3. 部署前端到 Vercel

---

## 🧪 第一步：测试本地连接（5 分钟）

在本地测试后端是否能正常连接到 Supabase：

```bash
# 1. 进入 backend 目录
cd backend

# 2. 激活虚拟环境（如果有）
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows

# 3. 安装依赖（如果还没安装）
pip install -r requirements.txt

# 4. 运行连接测试脚本
python test_supabase_connection.py
```

**预期输出**：
```
🔍 开始测试 Supabase 数据库连接...
--------------------------------------------------
✓ 步骤 1: 测试基本连接...
  ✓ PostgreSQL 版本: PostgreSQL 15.x...
✓ 步骤 2: 检查数据库...
  ✓ 当前数据库: postgres
✓ 步骤 3: 检查数据表...
  ✓ 找到 8 个表:
    - audit_logs
    - document_links
    - expenses
    - project_members
    - projects
    - tasks
    - users
✓ 步骤 4: 检查用户表...
  ✓ 用户表中有 1 个用户
✓ 步骤 5: 检查管理员账户...
  ✓ 管理员账户: 系统管理员 (admin@example.com)
==================================================
✅ 所有测试通过！数据库连接正常！
==================================================
```

### 如果测试失败

检查以下几点：
1. `backend/.env` 文件是否正确
2. 数据库密码是否正确（Purina5810）
3. 网络连接是否正常

---

## 🖥️ 第二步：本地运行测试（可选，5 分钟）

测试完连接后，可以在本地启动完整应用：

### 启动后端

```bash
# 在 backend 目录下
cd backend
uvicorn src.api.main:app --reload

# 访问 API 文档
# 打开浏览器：http://localhost:8000/docs
```

### 启动前端

```bash
# 在新的终端窗口
cd frontend
npm install  # 如果还没安装
npm run dev

# 访问前端
# 打开浏览器：http://localhost:5173
```

### 测试登录

- 邮箱：`admin@example.com`
- 密码：`admin123456`

---

## ☁️ 第三步：部署到 Vercel（20-30 分钟）

### 3.1 部署后端

#### 选项 A：使用 Vercel（推荐用于演示）

**优点**：快速部署，免费额度
**缺点**：Serverless 函数有 10 秒执行限制

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Add New** > **Project**
3. 导入 GitHub 仓库
4. 配置：
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: 留空
   - **Install Command**: `pip install -r requirements.txt`

5. 添加环境变量（点击 Environment Variables）：
   ```
   APP_NAME=用户体验拯救项目群管理系统
   DEBUG=False
   DATABASE_URL=postgresql+asyncpg://postgres.djgmecfoecjkfqhieavg:Purina5810@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
   SECRET_KEY=b0c1ac5c1a5a92aa98ad9179f2f1e042eaaf7746cddcce7895a920e76f6da354
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   SUPABASE_URL=https://djgmecfoecjkfqhieavg.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ21lY2ZvZWNqa2ZxaGllYXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTgyNDUsImV4cCI6MjA3Njg5NDI0NX0.m8bJgCTru7hep9Y_raoM7CFVii4vRdTn8g-Cb8Dxin0
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ21lY2ZvZWNqa2ZxaGllYXZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMxODI0NSwiZXhwIjoyMDc2ODk0MjQ1fQ.-UnVkwF0gU_tSTRp8laCP9BfiWtemXmCpUKFx6BSINM
   ```

6. 点击 **Deploy**

7. 部署完成后记录后端 URL：
   ```
   https://your-backend-xxx.vercel.app
   ```

#### 选项 B：使用 Render（推荐用于生产）

**优点**：更稳定，适合长时间运行的任务
**缺点**：需要信用卡验证（免费额度）

1. 访问 [Render Dashboard](https://dashboard.render.com/)
2. 点击 **New** > **Web Service**
3. 连接 GitHub 仓库
4. 配置：
   - **Name**: `ux-rescue-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.api.main:app --host 0.0.0.0 --port $PORT`

5. 添加环境变量（同上）
6. 点击 **Create Web Service**

### 3.2 部署前端

1. 在 Vercel Dashboard，点击 **Add New** > **Project**
2. 选择同一个仓库（或者如果已经导入过，就选择 **Import Git Repository**）
3. 配置：
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. 添加环境变量：
   ```
   VITE_API_BASE_URL=https://your-backend-xxx.vercel.app
   VITE_DEBUG=false
   VITE_SUPABASE_URL=https://djgmecfoecjkfqhieavg.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ21lY2ZvZWNqa2ZxaGllYXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTgyNDUsImV4cCI6MjA3Njg5NDI0NX0.m8bJgCTru7hep9Y_raoM7CFVii4vRdTn8g-Cb8Dxin0
   ```

5. 点击 **Deploy**

### 3.3 更新 CORS 配置

前端部署完成后：

1. 记录前端 URL：`https://your-frontend-xxx.vercel.app`
2. 回到后端 Vercel 项目
3. Settings > Environment Variables
4. 编辑 `ALLOWED_ORIGINS`：
   ```
   https://your-frontend-xxx.vercel.app
   ```
5. 重新部署后端（Deployments > 最新部署 > Redeploy）

---

## ✅ 第四步：验证部署

1. 访问前端 URL
2. 使用管理员账号登录：
   - 邮箱：`admin@example.com`
   - 密码：`admin123456`

3. 测试功能：
   - 创建项目
   - 创建任务
   - 添加支出
   - 查看仪表板

---

## 🔧 常见问题

### 问题 1: Vercel 部署后端失败

**可能原因**：
- `vercel.json` 配置有误
- Python 依赖安装失败
- 代码中有语法错误

**解决方法**：
1. 查看 Vercel 部署日志
2. 检查 `backend/vercel.json` 配置
3. 考虑使用 Render 部署

### 问题 2: 前端无法连接后端

**可能原因**：
- CORS 配置错误
- 后端 URL 配置错误

**解决方法**：
1. 检查前端 `VITE_API_BASE_URL` 环境变量
2. 检查后端 `ALLOWED_ORIGINS` 环境变量
3. 在浏览器 F12 > Network 查看请求详情

### 问题 3: 数据库连接超时

**可能原因**：
- 数据库连接字符串错误
- Supabase 数据库暂停（免费版会自动暂停）

**解决方法**：
1. 检查 `DATABASE_URL` 是否正确
2. 登录 Supabase Dashboard 检查数据库状态
3. 如果数据库暂停，访问一次会自动恢复

---

## 📚 其他资源

- [完整部署指南](./SUPABASE_VERCEL_部署指南.md)
- [Vercel 文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Render 文档](https://render.com/docs)

---

## 🎉 完成后

恭喜！您的应用已成功部署到云端！

**建议的后续优化**：

1. **安全性**：
   - 修改默认管理员密码
   - 设置数据库备份
   - 启用 Supabase Row Level Security (RLS)

2. **性能**：
   - 启用 CDN 缓存
   - 监控数据库查询性能
   - 优化前端资源加载

3. **自定义域名**：
   - 在 Vercel 添加自定义域名
   - 配置 DNS 记录

---

**需要帮助？**

如果遇到任何问题，请：
1. 查看详细的 [SUPABASE_VERCEL_部署指南.md](./SUPABASE_VERCEL_部署指南.md)
2. 检查 Vercel/Render 部署日志
3. 查看 Supabase 数据库日志

祝您部署顺利！🚀

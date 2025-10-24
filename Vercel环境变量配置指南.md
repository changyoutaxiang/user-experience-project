# Vercel 环境变量配置指南

## 📋 部署步骤总览

1. **先部署后端** → 获得后端 URL
2. **再部署前端** → 使用后端 URL 配置
3. **更新后端 CORS** → 添加前端 URL

---

## 🔧 第一步：部署后端

### 1.1 在 Vercel 创建后端项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Add New** > **Project**
3. 选择 **Import Git Repository**
4. 选择您的 GitHub 仓库
5. 配置项目：
   - **Project Name**: `ux-rescue-backend`（或您喜欢的名称）
   - **Framework Preset**: **Other**
   - **Root Directory**: 点击 **Edit**，选择 `backend`
   - **Build Command**: 留空
   - **Output Directory**: 留空
   - **Install Command**: `pip install -r requirements.txt`

### 1.2 配置后端环境变量

点击 **Environment Variables** 部分，逐个添加以下变量：

**方法一：逐个添加（推荐）**

| Key | Value |
|-----|-------|
| `APP_NAME` | `用户体验拯救项目群管理系统` |
| `DEBUG` | `False` |
| `DATABASE_URL` | `postgresql+asyncpg://postgres.djgmecfoecjkfqhieavg:Purina5810@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres` |
| `SECRET_KEY` | `b0c1ac5c1a5a92aa98ad9179f2f1e042eaaf7746cddcce7895a920e76f6da354` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
| `SUPABASE_URL` | `https://djgmecfoecjkfqhieavg.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ21lY2ZvZWNqa2ZxaGllYXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTgyNDUsImV4cCI6MjA3Njg5NDI0NX0.m8bJgCTru7hep9Y_raoM7CFVii4vRdTn8g-Cb8Dxin0` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ21lY2ZvZWNqa2ZxaGllYXZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMxODI0NSwiZXhwIjoyMDc2ODk0MjQ1fQ.-UnVkwF0gU_tSTRp8laCP9BfiWtemXmCpUKFx6BSINM` |

**方法二：批量复制（可选）**

您也可以打开 `backend/vercel-env-vars.txt` 文件，复制所有内容，然后在 Vercel 环境变量界面使用批量导入功能。

⚠️ **重要提示**：
- `ALLOWED_ORIGINS` 的值 `https://your-frontend.vercel.app` 是占位符
- 等前端部署完成后，需要回来更新这个值为实际的前端 URL

### 1.3 部署后端

1. 确认所有环境变量已添加
2. 点击 **Deploy** 按钮
3. 等待部署完成（约 2-5 分钟）
4. **记录后端 URL**，例如：
   ```
   https://ux-rescue-backend.vercel.app
   ```
   或
   ```
   https://ux-rescue-backend-xxx.vercel.app
   ```

### 1.4 验证后端部署

访问以下 URL 验证后端是否正常：

```
https://your-backend-url.vercel.app/docs
```

如果看到 FastAPI 的 Swagger UI 文档页面，说明后端部署成功！✅

---

## 🎨 第二步：部署前端

### 2.1 在 Vercel 创建前端项目

1. 回到 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Add New** > **Project**
3. 选择同一个 GitHub 仓库
4. 配置项目：
   - **Project Name**: `ux-rescue-frontend`（或您喜欢的名称）
   - **Framework Preset**: 自动检测为 **Vite** ✅
   - **Root Directory**: 点击 **Edit**，选择 `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.2 配置前端环境变量

点击 **Environment Variables** 部分，添加以下变量：

**将后端 URL 替换为您实际的后端地址！**

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://your-backend-url.vercel.app` ⚠️ **替换为实际后端 URL** |
| `VITE_DEBUG` | `false` |
| `VITE_SUPABASE_URL` | `https://djgmecfoecjkfqhieavg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ21lY2ZvZWNqa2ZxaGllYXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTgyNDUsImV4cCI6MjA3Njg5NDI0NX0.m8bJgCTru7hep9Y_raoM7CFVii4vRdTn8g-Cb8Dxin0` |

💡 **提示**：也可以打开 `frontend/vercel-env-vars.txt` 文件参考。

### 2.3 部署前端

1. 确认所有环境变量已添加
2. 确认 `VITE_API_BASE_URL` 已替换为实际后端 URL
3. 点击 **Deploy** 按钮
4. 等待部署完成（约 2-5 分钟）
5. **记录前端 URL**，例如：
   ```
   https://ux-rescue-frontend.vercel.app
   ```

---

## 🔄 第三步：更新后端 CORS 配置

现在您有了前端 URL，需要更新后端允许的来源。

### 3.1 更新后端环境变量

1. 回到 Vercel Dashboard
2. 选择后端项目（`ux-rescue-backend`）
3. 进入 **Settings** > **Environment Variables**
4. 找到 `ALLOWED_ORIGINS` 变量
5. 点击编辑按钮（铅笔图标）
6. 将值更新为：
   ```
   https://your-frontend-url.vercel.app
   ```
   **示例**：
   ```
   https://ux-rescue-frontend.vercel.app
   ```

7. 点击 **Save**

### 3.2 重新部署后端

更新环境变量后需要重新部署：

1. 点击顶部导航的 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧的三个点 **···**
4. 选择 **Redeploy**
5. 确认重新部署

等待约 2-3 分钟，重新部署完成。

---

## ✅ 第四步：验证完整部署

### 4.1 测试应用

1. 访问前端 URL：`https://your-frontend-url.vercel.app`
2. 您应该看到登录页面
3. 使用管理员账号登录：
   - **邮箱**: `admin@example.com`
   - **密码**: `admin123456`

### 4.2 测试功能

登录后测试以下功能：

- ✅ 查看仪表板
- ✅ 创建新项目
- ✅ 创建任务
- ✅ 添加支出
- ✅ 查看用户列表

如果所有功能正常，恭喜您！部署成功！🎉

---

## 🔧 常见问题排查

### 问题 1: 后端部署失败

**检查项**：
1. Root Directory 是否设置为 `backend`
2. `vercel.json` 文件是否存在于 `backend` 目录
3. 查看部署日志中的错误信息

**解决方案**：
- 如果是 Python 版本问题，在 `backend/runtime.txt` 添加：
  ```
  python-3.11
  ```

### 问题 2: 前端无法连接后端（CORS 错误）

**症状**：
浏览器控制台显示 CORS 错误：
```
Access to XMLHttpRequest at 'https://backend.vercel.app/api/...'
from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

**解决方案**：
1. 确认后端 `ALLOWED_ORIGINS` 包含前端 URL
2. 确认已重新部署后端
3. 清除浏览器缓存

### 问题 3: 前端显示 API 连接错误

**检查项**：
1. 前端 `VITE_API_BASE_URL` 是否正确
2. 后端 URL 是否可访问（访问 `/docs` 路径）
3. 浏览器开发者工具 > Network 查看请求详情

**解决方案**：
- 确认 `VITE_API_BASE_URL` 末尾没有斜杠 `/`
- 正确：`https://backend.vercel.app`
- 错误：`https://backend.vercel.app/`

### 问题 4: 数据库连接失败

**症状**：
后端日志显示数据库连接超时或拒绝连接

**解决方案**：
1. 检查 `DATABASE_URL` 是否正确
2. 确认使用的是 Transaction Pooler（端口 6543）
3. 登录 Supabase Dashboard 检查数据库状态
4. 检查数据库密码是否正确

---

## 📝 环境变量快速参考

### 后端环境变量（10 个）

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

### 前端环境变量（4 个）

```
VITE_API_BASE_URL=https://your-backend.vercel.app
VITE_DEBUG=false
VITE_SUPABASE_URL=https://djgmecfoecjkfqhieavg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ21lY2ZvZWNqa2ZxaGllYXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTgyNDUsImV4cCI6MjA3Njg5NDI0NX0.m8bJgCTru7hep9Y_raoM7CFVii4vRdTn8g-Cb8Dxin0
```

---

## 🎉 完成！

恭喜您完成部署！您的应用现在已经在云端运行了！

**重要的安全提醒**：
1. ⚠️ 部署完成后请立即修改管理员密码
2. ⚠️ 定期备份 Supabase 数据库
3. ⚠️ 监控应用日志，及时发现问题

**下一步优化**：
- 添加自定义域名
- 配置 CDN 加速
- 设置错误监控（如 Sentry）
- 启用数据库备份
- 配置 CI/CD 自动部署

祝您使用愉快！🚀

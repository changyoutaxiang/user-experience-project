# 立即开始部署 - 简化步骤

> 💡 **Railway CLI 已安装！** 现在只需几个命令即可完成部署

## 🚀 5步完成部署

### 步骤 1: 登录 Railway

在终端运行：
```bash
railway login
```

**会发生什么**：
- ✅ 浏览器会自动打开
- ✅ 显示授权页面
- ✅ 点击 "Authorize" 按钮
- ✅ 返回终端看到 "Logged in" 消息

---

### 步骤 2: 初始化项目

```bash
railway init
```

**交互提示**：
- 项目名称：输入 `ux-rescue-pm` (或按回车使用默认)
- 模板：选择 `Empty Project`

**预期输出**：
```
✅ Created project ux-rescue-pm
```

---

### 步骤 3: 添加 PostgreSQL 数据库

**方式 A - 在网站添加（推荐）**：
1. 运行 `railway open` 打开项目
2. 点击 "New" → "Database" → "Add PostgreSQL"
3. 等待数据库创建完成（约 30 秒）

**方式 B - 使用 CLI**：
```bash
railway add
# 选择 PostgreSQL
```

---

### 步骤 4: 部署后端

```bash
# 创建后端服务
railway service create backend

# 切换到后端服务
railway service backend

# 设置环境变量
railway variables set SECRET_KEY=$(openssl rand -hex 32)
railway variables set ALGORITHM=HS256
railway variables set ACCESS_TOKEN_EXPIRE_MINUTES=30
railway variables set DEBUG=False

# 部署后端
cd backend
railway up
cd ..

# 生成后端域名
railway domain
```

**记下后端 URL**（类似）：
```
https://ux-rescue-backend-production.up.railway.app
```

**⚠️ 重要 - 设置数据库连接**：

```bash
# 查看当前变量
railway variables

# 找到 DATABASE_URL，复制它的值
# 将 postgresql:// 改为 postgresql+asyncpg://
# 然后设置：
railway variables set DATABASE_URL=postgresql+asyncpg://postgres:xxx@xxx.railway.app:5432/railway
```

**运行数据库迁移和种子数据**：
```bash
railway run alembic upgrade head
railway run python -m src.utils.seed_data
```

---

### 步骤 5: 部署前端

```bash
# 创建前端服务
railway service create frontend

# 切换到前端服务
railway service frontend

# 设置后端 URL（替换为您的实际后端 URL）
railway variables set VITE_API_BASE_URL=https://ux-rescue-backend-production.up.railway.app

# 部署前端
cd frontend
railway up
cd ..

# 生成前端域名
railway domain
```

**记下前端 URL**（类似）：
```
https://ux-rescue-frontend-production.up.railway.app
```

---

### 步骤 6: 更新后端 CORS

```bash
# 切换回后端
railway service backend

# 设置允许的前端域名（替换为您的实际前端 URL）
railway variables set ALLOWED_ORIGINS=https://ux-rescue-frontend-production.up.railway.app

# 重新部署后端
cd backend
railway up
cd ..
```

---

## ✅ 验证部署

### 1. 检查后端

```bash
# 健康检查
curl https://your-backend-url.railway.app/health
```

**预期返回**：
```json
{
  "status": "healthy",
  "app": "用户体验拯救项目管理系统"
}
```

### 2. 访问 API 文档

浏览器打开：
```
https://your-backend-url.railway.app/docs
```

### 3. 访问前端应用

浏览器打开：
```
https://your-frontend-url.railway.app
```

### 4. 测试登录

使用默认账号：
- **管理员**: admin@example.com / admin123456
- **成员**: zhangsan@example.com / password123

---

## 🎯 完整命令清单（复制粘贴版）

```bash
# 1. 登录
railway login

# 2. 初始化项目
railway init

# 3. 添加数据库（在网站操作）
railway open

# 4. 部署后端
railway service create backend
railway service backend
railway variables set SECRET_KEY=$(openssl rand -hex 32)
railway variables set ALGORITHM=HS256
railway variables set ACCESS_TOKEN_EXPIRE_MINUTES=30
railway variables set DEBUG=False
cd backend && railway up && cd ..
railway domain

# 记下后端 URL，然后设置 DATABASE_URL
# railway variables
# railway variables set DATABASE_URL=postgresql+asyncpg://...

# 运行迁移
railway run alembic upgrade head
railway run python -m src.utils.seed_data

# 5. 部署前端
railway service create frontend
railway service frontend
railway variables set VITE_API_BASE_URL=<后端URL>
cd frontend && railway up && cd ..
railway domain

# 6. 更新 CORS
railway service backend
railway variables set ALLOWED_ORIGINS=<前端URL>
cd backend && railway up && cd ..
```

---

## 📋 检查清单

部署过程中请确认：

- [ ] Railway CLI 已登录 (`railway whoami`)
- [ ] 项目已创建
- [ ] PostgreSQL 数据库已添加
- [ ] 后端服务已部署并生成域名
- [ ] DATABASE_URL 已设置为 `postgresql+asyncpg://` 格式
- [ ] 数据库迁移已运行
- [ ] 种子数据已导入
- [ ] 前端服务已部署并生成域名
- [ ] VITE_API_BASE_URL 已设置
- [ ] ALLOWED_ORIGINS 已更新
- [ ] 后端健康检查通过
- [ ] 前端可以访问
- [ ] 可以成功登录

---

## 🆘 遇到问题？

### 查看日志
```bash
railway service backend
railway logs

railway service frontend
railway logs
```

### 查看变量
```bash
railway variables
```

### 重新部署
```bash
railway up
```

### 打开网站仪表板
```bash
railway open
```

---

## 💡 快速提示

1. **每个命令都需要等待完成**再执行下一个
2. **记录下所有 URL** - 后面会用到
3. **DATABASE_URL 格式很重要** - 必须是 `postgresql+asyncpg://`
4. **先部署后端**，再部署前端
5. **最后更新 CORS** 很关键

---

## 🎉 部署成功后

您将得到：
- ✅ 完整的后端 API
- ✅ 响应式前端应用
- ✅ PostgreSQL 数据库
- ✅ 自动 HTTPS
- ✅ 自动扩展

**立即开始使用您的项目管理系统！** 🚀

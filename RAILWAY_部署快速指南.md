# Railway 部署快速指南

> 🚀 **5分钟快速部署** - 核心步骤精简版
>
> 📖 详细版本请查看: [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md)

---

## ⚡ 快速开始

### 前置条件

```bash
✅ Railway Hobby Plan 账号
✅ GitHub 仓库: https://github.com/changyoutaxiang/user-experience-project.git
✅ 仓库包含 backend/nixpacks.toml 和 frontend/nixpacks.toml
```

---

## 📋 部署步骤

### 1️⃣ 创建项目 (1分钟)

1. 访问 https://railway.app 并登录
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 选择仓库: `changyoutaxiang/user-experience-project`
5. 点击 **"Deploy"** (先忽略环境变量)

**结果**: 自动创建 backend 和 frontend 两个服务

---

### 2️⃣ 添加数据库 (30秒)

1. 点击 **"New"** → **"Database"** → **"Add PostgreSQL"**
2. 等待数据库创建完成

**结果**: 项目中新增 Postgres 服务

---

### 3️⃣ 配置后端 (2分钟)

#### 设置环境变量

进入 **backend 服务** → **Variables** 标签,添加:

```bash
# 1. 修改自动生成的 DATABASE_URL
DATABASE_URL=postgresql+asyncpg://postgres:xxx@...  # 在 postgresql 后加 +asyncpg

# 2. 生成随机密钥 (访问 https://www.random.org/strings/ 或使用下面命令)
SECRET_KEY=<64位随机字符串>

# 3. 添加其他必需变量
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=False
ALLOWED_ORIGINS=  # 暂时留空,等前端域名生成后填写
```

#### 生成域名

1. **Settings** → **Networking** → **"Generate Domain"**
2. 复制生成的 URL (如: `https://xxx-backend-production.up.railway.app`)
3. **Deployments** → **"Redeploy"**

---

### 4️⃣ 配置前端 (1分钟)

#### 设置环境变量

进入 **frontend 服务** → **Variables** 标签:

```bash
VITE_API_BASE_URL=<后端URL>  # 使用步骤3复制的后端URL,不要末尾斜杠
```

#### 生成域名

1. **Settings** → **Networking** → **"Generate Domain"**
2. 复制前端 URL (如: `https://xxx-frontend-production.up.railway.app`)
3. **Deployments** → **"Redeploy"**

---

### 5️⃣ 更新 CORS 配置 (30秒)

1. 返回 **backend 服务** → **Variables**
2. 编辑 `ALLOWED_ORIGINS`,填入前端 URL
3. **Deployments** → **"Redeploy"**

---

### 6️⃣ 验证部署 (1分钟)

#### 测试后端

访问: `https://<后端域名>/health`

应返回:
```json
{
  "status": "healthy",
  "app": "用户体验拯救项目管理系统"
}
```

#### 测试前端

访问: `https://<前端域名>`

应看到登录页面

---

### 7️⃣ 初始化数据 (1分钟)

#### 方法1: 通过 API 创建用户

1. 访问: `https://<后端域名>/docs`
2. 找到 `POST /api/auth/register`
3. 点击 "Try it out",输入:
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123456",
     "username": "管理员"
   }
   ```
4. 点击 "Execute"

#### 方法2: 使用 Railway CLI

```bash
brew install railway
railway login
railway link  # 选择项目
railway service backend
railway run python -m src.utils.seed_data
```

---

### 8️⃣ 登录测试 ✅

访问前端 URL,使用创建的账号登录:

```
邮箱: admin@example.com
密码: admin123456
```

**🎉 部署成功!**

---

## 🔧 配置检查清单

```bash
✅ PostgreSQL 数据库已添加
✅ DATABASE_URL 格式: postgresql+asyncpg://...
✅ SECRET_KEY 已设置(64位随机字符串)
✅ 后端域名已生成
✅ VITE_API_BASE_URL 已设置为后端URL
✅ 前端域名已生成
✅ ALLOWED_ORIGINS 已设置为前端URL
✅ /health 返回 healthy
✅ /docs 可访问
✅ 前端登录页面正常显示
✅ 可以成功登录
```

---

## 🚨 常见问题速查

### 后端部署失败

```bash
# 检查 DATABASE_URL 格式
❌ postgresql://...
✅ postgresql+asyncpg://...

# 检查 Root Directory
Settings → Environment → Root Directory = /backend
```

### 前端 CORS 错误

```bash
# 检查后端环境变量
ALLOWED_ORIGINS=https://xxx-frontend-production.up.railway.app

# 注意: 不要末尾斜杠,包含 https://
```

### 数据库连接失败

```bash
# 确保 Postgres 服务状态为 Active
# 确保 DATABASE_URL 已正确添加 +asyncpg
# 重新部署后端
```

### 空白页面

```bash
# 检查前端环境变量
VITE_API_BASE_URL=https://xxx-backend-production.up.railway.app

# 检查 Build Logs 是否有错误
# 重新部署前端
```

---

## 📊 部署架构

```
GitHub → Railway
  ├── Backend (FastAPI) → PostgreSQL
  └── Frontend (React)  → Backend API
```

---

## 💰 成本预估

**Hobby Plan ($5/月 免费额度)**:
- Backend: ~$1-1.5/月
- Frontend: ~$0.5-1/月
- PostgreSQL: ~$0.5-1/月
- **总计: $2-3.5/月** (完全在免费额度内)

---

## 🔗 快速链接

| 资源 | 链接 |
|------|------|
| Railway Dashboard | https://railway.app/dashboard |
| 后端 API 文档 | `https://<后端域名>/docs` |
| 前端应用 | `https://<前端域名>` |
| 健康检查 | `https://<后端域名>/health` |
| 详细部署指南 | [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md) |
| Railway 文档 | https://docs.railway.app |

---

## 🔄 后续更新

**自动部署已配置**:
- 推送代码到 GitHub → Railway 自动构建 → 自动部署
- 查看实时日志: Deployments → 点击部署 → Deploy Logs

**手动重新部署**:
- Deployments → 三点菜单 → Redeploy

---

## 📝 关键信息记录

部署完成后填写:

```
Railway 项目名称: _________________
后端 URL: https://_________________.railway.app
前端 URL: https://_________________.railway.app
管理员账号: admin@example.com
管理员密码: admin123456
```

---

**部署时间**: ~7分钟
**难度**: ⭐⭐ (简单)
**成本**: 免费 (Hobby Plan)

*最后更新: 2025-10-23*

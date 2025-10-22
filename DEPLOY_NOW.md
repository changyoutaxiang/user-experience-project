# Railway 网页部署快速指南

> 🚀 **5 步完成部署** - 纯网页操作，无需命令行

---

## 开始之前

### 您需要的：
- ✅ Railway Hobby Plan 账号（您已有）
- ✅ GitHub 账号
- ✅ 代码仓库：https://github.com/changyoutaxiang/user-experience-project.git

---

## 🎯 部署步骤

### 步骤 1：创建 Railway 项目

1. **访问 Railway**：https://railway.app
2. **登录** 您的账号
3. **点击 "New Project"**
4. **选择 "Deploy from GitHub repo"**
5. **授权 GitHub**（首次使用）
6. **选择仓库**：`changyoutaxiang/user-experience-project`
7. **点击 "Deploy"**

**✅ 预期结果**：Railway 创建了 backend 和 frontend 两个服务

---

### 步骤 2：添加数据库

1. **在项目页面，点击 "New"**
2. **选择 "Database" -> "Add PostgreSQL"**
3. **等待 30 秒** 数据库创建完成
4. **点击 Postgres 服务 -> Variables 标签**
5. **复制 `DATABASE_URL` 的值**（保存备用）

**✅ 预期结果**：项目显示 3 个服务（backend、frontend、Postgres）

---

### 步骤 3：配置后端

#### 3.1 设置环境变量

1. **点击 "backend" 服务 -> Variables 标签**
2. **添加以下变量**（点击 "New Variable"）：

```
SECRET_KEY = <生成一个64位随机字符串>
ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 30
DEBUG = False
```

3. **修改 `DATABASE_URL`**（已自动生成）：
   - 点击编辑图标
   - 将 `postgresql://` 改为 `postgresql+asyncpg://`
   - 保存

**示例**：
```
原：postgresql://postgres:xxx@postgres.railway.internal:5432/railway
改：postgresql+asyncpg://postgres:xxx@postgres.railway.internal:5432/railway
```

#### 3.2 生成域名

1. **Settings 标签 -> Networking**
2. **点击 "Generate Domain"**
3. **复制域名**（类似：`https://xxx.railway.app`）

#### 3.3 重新部署

1. **Deployments 标签**
2. **点击 "Redeploy"**
3. **等待 2-3 分钟**

**✅ 预期结果**：部署状态显示绿色 "Success"

---

### 步骤 4：配置前端

#### 4.1 设置环境变量

1. **返回项目主页**
2. **点击 "frontend" 服务 -> Variables 标签**
3. **添加变量**：

```
VITE_API_BASE_URL = <您的后端域名>
```

**示例**：
```
VITE_API_BASE_URL=https://ux-rescue-backend-production.up.railway.app
```

#### 4.2 生成域名

1. **Settings -> Networking**
2. **Generate Domain**
3. **复制前端域名**

#### 4.3 重新部署

1. **Deployments -> Redeploy**
2. **等待 2-3 分钟**

**✅ 预期结果**：前端部署成功

---

### 步骤 5：完成配置

#### 5.1 更新后端 CORS

1. **返回 backend 服务 -> Variables**
2. **添加变量**：

```
ALLOWED_ORIGINS = <您的前端域名>
```

**示例**：
```
ALLOWED_ORIGINS=https://ux-rescue-frontend-production.up.railway.app
```

3. **Deployments -> Redeploy**

#### 5.2 初始化数据库

**方法 1：通过 API 文档注册**

1. 访问：`https://<后端域名>/docs`
2. 找到 `POST /api/auth/register`
3. 点击 "Try it out"
4. 输入：
```json
{
  "email": "admin@example.com",
  "password": "admin123456",
  "username": "管理员"
}
```
5. 点击 "Execute"

**方法 2：使用 Railway CLI**（一次性）

```bash
brew install railway
railway login
railway link
railway service backend
railway run python -m src.utils.seed_data
```

---

## ✅ 验证部署

### 1. 检查后端

访问：`https://<后端域名>/health`

**应该看到**：
```json
{
  "status": "healthy",
  "app": "用户体验拯救项目管理系统"
}
```

### 2. 访问 API 文档

访问：`https://<后端域名>/docs`

**应该看到**：Swagger UI 界面

### 3. 访问前端

访问：`https://<前端域名>`

**应该看到**：登录页面

### 4. 测试登录

- **邮箱**：admin@example.com
- **密码**：admin123456

---

## 📊 部署架构

```
GitHub Repository
        ↓
    Railway
        ├── Backend (FastAPI + Python)
        ├── Frontend (React + Vite)
        └── PostgreSQL Database
```

---

## 🔧 常见问题

### Q: 后端部署失败？

**检查**：
- DATABASE_URL 格式是否为 `postgresql+asyncpg://`
- 环境变量是否都已设置

**解决**：查看 Deployments -> Logs 找到错误信息

### Q: 前端无法连接后端？

**检查**：
- VITE_API_BASE_URL 是否正确
- ALLOWED_ORIGINS 是否包含前端域名

**解决**：修改变量后重新部署

### Q: 无法登录？

**原因**：数据库没有用户

**解决**：通过 API 文档注册用户（见步骤 5.2）

---

## 📝 信息记录表

| 项目 | 值 | 状态 |
|------|-----|------|
| **后端 URL** | https://_____________.railway.app | ⏳ |
| **前端 URL** | https://_____________.railway.app | ⏳ |
| **管理员邮箱** | admin@example.com | ✅ |
| **管理员密码** | admin123456 | ✅ |

---

## 🎉 完成！

**部署成功后，您拥有**：

- ✅ 公开访问的项目管理系统
- ✅ 完整的 REST API
- ✅ PostgreSQL 数据库
- ✅ 自动 HTTPS 加密
- ✅ 自动 CI/CD（推送代码自动部署）

---

## 📚 更多帮助

- **详细教程**：查看 [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md)
- **简易教程**：查看 [WEB_DEPLOYMENT.md](WEB_DEPLOYMENT.md)
- **Railway 文档**：https://docs.railway.app

---

**祝您使用愉快！** 🚀

*最后更新：2025-10-22*

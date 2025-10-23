# Railway 重新开始部署指南

> 🔄 如果初次部署失败，从零开始的完整步骤

---

## 🗑️ 第一步: 清理（如果需要）

### 如果您已经创建了项目但失败了：

1. **打开 Railway Dashboard**: https://railway.app/dashboard
2. **找到项目**（比如叫 user-experience-project 或类似名字）
3. **点击项目卡片**进入项目
4. **删除失败的服务**（保留 PostgreSQL 如果已创建）:
   - 点击每个服务卡片
   - 进入 **Settings** 标签
   - 滚动到最底部
   - 点击红色的 **"Delete Service"** 按钮
   - 确认删除

**只删除服务，不要删除整个项目！**

---

## ✨ 第二步: 正确的部署流程

### 方法 A: 网页界面部署（推荐新手）

#### 1. 创建空项目（如果还没有）

1. 访问: https://railway.app/dashboard
2. 点击 **"New Project"**
3. 选择 **"Empty Project"**
4. 项目会自动创建

#### 2. 添加 PostgreSQL 数据库

1. 在项目页面（应该是空的），找到 **"+ New"** 按钮（通常在右上角或中间）
2. 点击后选择 **"Database"**
3. 选择 **"Add PostgreSQL"**
4. 等待创建完成（看到绿色 Active 状态）

现在您应该看到一个 PostgreSQL 卡片。

#### 3. 添加 Backend 服务

**重要**: 这次我们要指定目录！

1. 点击 **"+ New"** 按钮
2. 选择 **"GitHub Repo"**
3. 如果第一次使用，会提示授权 GitHub:
   - 点击 **"Configure GitHub App"**
   - 选择允许访问 `changyoutaxiang/user-experience-project` 仓库
   - 点击 **"Install & Authorize"**
4. 选择仓库: **`changyoutaxiang/user-experience-project`**
5. **关键步骤**: 看到 "Add variables" 或配置页面时:
   - **不要立即点击 Deploy**
   - 找到 **"Root Directory"** 字段（可能需要展开 "Advanced" 或 "Settings"）
   - 填入: `backend`
6. 现在点击 **"Deploy"** 或 **"Add Service"**

**如果找不到 Root Directory 字段**:
- 先点击 "Deploy" 让服务创建
- 然后立即进入服务的 Settings 修改（见下面的"事后补救"）

#### 4. 配置 Backend 环境变量

服务创建后：

1. **点击 backend 服务卡片**（可能显示为 user-experience-project 或类似名字）
2. 进入 **"Variables"** 标签
3. 点击 **"New Variable"** 或直接编辑
4. 添加以下变量:

**必需变量**:
```bash
# 数据库连接（修改自动生成的）
DATABASE_URL = postgresql+asyncpg://postgres:xxx@xxx  # 点击已有的编辑，加上 +asyncpg

# 安全密钥（生成随机字符串）
SECRET_KEY = <访问 https://www.random.org/strings/ 生成64位字符串>

# JWT 配置
ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 环境
DEBUG = False

# CORS（先留空）
ALLOWED_ORIGINS =
```

**如何修改 DATABASE_URL**:
- Railway 会自动添加一个 `DATABASE_URL` 变量（从 Postgres 服务链接的）
- 点击这个变量右侧的 **编辑图标**（铅笔）
- 原始值: `postgresql://postgres:xxx@xxx`
- 修改为: `postgresql+asyncpg://postgres:xxx@xxx`
- 只需在 `postgresql` 后面加上 `+asyncpg`

#### 5. 设置 Backend Root Directory（事后补救）

1. 在 backend 服务中，进入 **"Settings"** 标签
2. 找到 **"Service"** 或 **"Source"** 部分
3. 查找 **"Root Directory"** 字段:
   - 如果是空的，填入: `backend`
   - 如果已经是 `/backend` 或 `backend`，那就对了
4. 保存更改

#### 6. 生成 Backend 域名

1. 还在 Settings 标签
2. 向下滚动到 **"Networking"** 部分
3. 找到 **"Public Networking"** 或 **"Domains"**
4. 点击 **"Generate Domain"** 按钮
5. 复制生成的域名（如: `https://xxx-production.up.railway.app`）

**保存这个 URL！** 配置前端时需要用到。

#### 7. 重新部署 Backend

1. 进入 **"Deployments"** 标签
2. 点击最新部署右侧的 **三点菜单 (⋮)**
3. 选择 **"Redeploy"**
4. 等待部署完成（2-5 分钟）

#### 8. 添加 Frontend 服务

1. **返回项目主页**（点击左上角项目名）
2. 点击 **"+ New"**
3. 选择 **"GitHub Repo"**
4. **再次选择同一个仓库**: `changyoutaxiang/user-experience-project`
5. **Root Directory**: `frontend`
6. Deploy

#### 9. 配置 Frontend 环境变量

1. 点击 **frontend 服务卡片**
2. **Variables** 标签
3. 添加:

```bash
VITE_API_BASE_URL = <刚才保存的 Backend URL>
```

例如:
```bash
VITE_API_BASE_URL = https://ux-rescue-backend-production.up.railway.app
```

**注意**: 不要在 URL 末尾加 `/`

#### 10. 设置 Frontend Root Directory

1. **Settings** 标签
2. **Root Directory**: `frontend`
3. 保存

#### 11. 生成 Frontend 域名

1. Settings → Networking
2. **Generate Domain**
3. 复制前端 URL（如: `https://xxx-frontend-production.up.railway.app`）

**保存这个 URL！**

#### 12. 重新部署 Frontend

1. **Deployments** → **Redeploy**
2. 等待完成

#### 13. 更新 Backend CORS

1. **返回 backend 服务**
2. **Variables** 标签
3. 找到 `ALLOWED_ORIGINS` 变量
4. 设置为前端 URL:
   ```bash
   ALLOWED_ORIGINS = https://xxx-frontend-production.up.railway.app
   ```
5. 保存后会自动触发重新部署

---

## ✅ 验证部署

### 1. 检查 Backend

访问: `https://<你的backend域名>/health`

应该返回:
```json
{
  "status": "healthy",
  "app": "用户体验拯救项目管理系统"
}
```

### 2. 检查 API 文档

访问: `https://<你的backend域名>/docs`

应该看到 Swagger UI 界面。

### 3. 检查 Frontend

访问: `https://<你的frontend域名>`

应该看到登录页面。

### 4. 创建用户

1. 访问后端 API 文档: `https://<backend>/docs`
2. 找到 `POST /api/auth/register`
3. 点击 "Try it out"
4. 输入:
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123456",
     "username": "管理员"
   }
   ```
5. 点击 "Execute"
6. 应该返回 201 Created

### 5. 测试登录

1. 访问前端
2. 使用刚创建的账号登录
3. 成功！🎉

---

## 📋 最终检查清单

部署完成后确认：

```
✅ 项目中有 3 个服务:
   - PostgreSQL (Active)
   - backend (Active)
   - frontend (Active)

✅ Backend 配置:
   - Root Directory = backend
   - 6 个环境变量已设置
   - DATABASE_URL 格式: postgresql+asyncpg://...
   - 域名已生成
   - 部署状态: Success

✅ Frontend 配置:
   - Root Directory = frontend
   - VITE_API_BASE_URL 已设置
   - 域名已生成
   - 部署状态: Success

✅ 功能验证:
   - /health 返回 healthy
   - /docs 可访问
   - 前端页面正常
   - 可以注册用户
   - 可以登录
```

---

## 🚨 如果还是失败

### 查看构建日志

1. 点击服务
2. Deployments 标签
3. 点击失败的部署
4. 查看 **Build Logs** 和 **Deploy Logs**
5. 找到 ERROR 信息

**把错误信息告诉我，我帮您分析！**

---

## 💡 关键要点

1. **Root Directory 是最重要的设置** - 必须设置为 `backend` 或 `frontend`
2. **DATABASE_URL 必须加 +asyncpg** - `postgresql+asyncpg://...`
3. **CORS 必须配置** - 否则前端无法调用后端
4. **先部署后端，再部署前端** - 因为前端需要后端的 URL

---

## 📸 界面参考

### 在哪里找到 Root Directory

```
服务页面
  └─ Settings 标签
      └─ Service Settings (展开)
          └─ Root Directory: [这里填 backend 或 frontend]
```

### 在哪里找到 Variables

```
服务页面
  └─ Variables 标签
      └─ [显示所有环境变量列表]
      └─ [+ New Variable 按钮]
```

### 在哪里找到 Generate Domain

```
服务页面
  └─ Settings 标签
      └─ Networking (向下滚动)
          └─ Public Networking
              └─ [Generate Domain 按钮]
```

---

**需要帮助？** 告诉我您当前卡在哪一步，或者把错误信息发给我！

*最后更新: 2025-10-23*

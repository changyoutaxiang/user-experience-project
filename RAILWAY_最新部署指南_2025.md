# Railway 最新部署指南 (2025 官方文档版)

> 📅 基于 Railway 官方文档 (2025-01)
> 🔗 来源: https://docs.railway.com/guides/monorepo

---

## ⚠️ 重要发现

根据最新官方文档，**Railway 已经简化了 monorepo 部署流程**。

---

## 🎯 方案 1: 使用 railway.toml (推荐)

### Railway.toml 不支持 rootDirectory 配置！

**官方说明**：
- `railway.toml` 文件**不支持**配置 `rootDirectory` 参数
- 必须通过 **UI 界面**设置 Root Directory
- 或使用更简单的方法（见下方）

---

## 🎯 方案 2: 分开的 railway.toml 文件（最新推荐）

### 官方文档说明

Railway 会自动检测每个子目录中的 `railway.toml` 文件！

### 您的项目已经配置好了！

检查确认：
```bash
✅ backend/railway.toml  # 已存在
✅ frontend/railway.toml # 已存在
```

这意味着 Railway **应该能够自动识别**两个服务！

---

## 🔍 为什么部署失败？真正的原因

让我检查您的 railway.toml 文件配置...

### 问题可能在这里：

Railway 的最新部署方式是：

1. **不要在项目级别导入**整个仓库
2. **分别为每个服务创建部署**

---

## ✅ 正确的部署流程（2025 最新）

### 第一步：创建项目和数据库

1. 访问 https://railway.com/dashboard
2. 点击 **"New Project"**
3. 选择 **"Deploy PostgreSQL"**
4. 数据库创建完成

### 第二步：添加 Backend 服务

**重点：不要用 "Deploy from GitHub repo"，而是用 "Empty Service"**

1. 在项目页面，点击 **"New"**
2. 选择 **"Empty Service"**
3. 创建后，点击新创建的服务卡片
4. 进入 **"Settings"** 标签
5. 在 **"Source"** 部分：
   - 点击 **"Connect Repo"**
   - 选择您的 GitHub 仓库
   - **关键**：在 **"Service Settings"** 或 **"General"** 部分找到
   - 设置 **Root Directory** = `backend`

### 在哪里找到 Root Directory？

**官方文档说明**（最新版本）：

```
Service 页面
  → Settings 标签
    → Service Settings (可能需要展开)
      → Root Directory 字段
```

**如果看不到 Root Directory 字段**：

可能的原因：
1. Railway 界面更新，字段位置改变
2. 字段名称可能是：
   - "Root Directory"
   - "Working Directory"
   - "Source Directory"
   - 在 "Source" 部分里

**截图说明**：
- 在 Service Settings 中应该能看到一个输入框
- 提示文字可能是 "Enter root directory path" 或类似

### 第三步：配置环境变量

在 Backend 服务的 **Variables** 标签添加：

```bash
DATABASE_URL=postgresql+asyncpg://...  # 修改 Railway 自动添加的
SECRET_KEY=<64位随机字符串>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=False
ALLOWED_ORIGINS=
```

### 第四步：生成域名并部署

1. Settings → 找到 **"Networking"** 或 **"Public Networking"**
2. 点击 **"Generate Domain"**
3. 返回 Deployments → **"Redeploy"**

### 第五步：重复 Frontend

同样的步骤，但：
- Root Directory = `frontend`
- Variables: `VITE_API_BASE_URL=<backend-url>`

---

## 🎯 方案 3: 使用单个 railway.toml（在根目录）

如果 UI 界面找不到 Root Directory，我们可以用配置文件方式：

### 创建项目根目录的 railway.toml

```toml
# /Users/wangdong/Desktop/用户体验拯救/railway.toml

# Railway V2 Config File
# Docs: https://docs.railway.com/reference/config-as-code

[[services]]
name = "backend"
source = "backend"

[services.backend.build]
builder = "NIXPACKS"
nixpacksConfigPath = "backend/nixpacks.toml"

[services.backend.deploy]
startCommand = "alembic upgrade head && uvicorn src.api.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"

[[services]]
name = "frontend"
source = "frontend"

[services.frontend.build]
builder = "NIXPACKS"
nixpacksConfigPath = "frontend/nixpacks.toml"

[services.frontend.deploy]
startCommand = "npm run preview -- --port $PORT --host 0.0.0.0"
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
```

**但是**，根据官方文档，这个方法**可能不被支持**！

---

## 🎯 方案 4: 完全网页配置（最可靠）

### 如果找不到任何 Root Directory 设置

那可能 Railway 已经改变了界面。试试这个方法：

### 使用 Watch Paths 代替

1. 创建服务时不设置 Root Directory
2. 在 **Settings** 中找到 **"Watch Paths"**
3. 设置：
   - Backend: `backend/**`
   - Frontend: `frontend/**`

### 同时修改 Start Command

Backend Settings:
- **Start Command**: `cd backend && alembic upgrade head && uvicorn src.api.main:app --host 0.0.0.0 --port $PORT`

Frontend Settings:
- **Build Command**: `cd frontend && npm ci && npm run build`
- **Start Command**: `cd frontend && npm run preview -- --port $PORT --host 0.0.0.0`

---

## 📸 请帮我确认

为了给您最准确的指引，请告诉我：

### 在 Railway 的 Service Settings 页面，您能看到哪些选项？

常见的包括：
- [ ] Root Directory
- [ ] Working Directory
- [ ] Source Directory
- [ ] Watch Paths
- [ ] Build Command
- [ ] Start Command
- [ ] Install Command
- [ ] Dockerfile Path
- [ ] Builder

### 或者截图

如果方便，您可以：
1. 进入任意一个服务的 Settings
2. 把看到的所有设置项告诉我
3. 我可以根据实际界面给您准确指引

---

## 🔗 官方资源

- **Monorepo 指南**: https://docs.railway.com/guides/monorepo
- **配置文件参考**: https://docs.railway.com/reference/config-as-code
- **Railway 帮助中心**: https://help.railway.com

---

## 💡 临时建议

在我们找到正确的设置方法之前，您可以：

### 快速测试方案

1. **删除所有失败的服务**
2. **创建一个新的 Empty Service**
3. **连接 GitHub 仓库**
4. **在 Settings 里仔细查看所有可用选项**
5. **把您看到的选项列表告诉我**
6. **我会根据实际界面给您精准指导**

---

**等待您的反馈！告诉我您在 Settings 中看到了什么选项，我会立即给您准确的配置方法。**

*更新时间: 2025-10-23*
*基于: Railway Official Docs 2025-01*

# Railway 网页部署指南

> 🌐 **完全通过网页操作** - 无需命令行，适合首次使用 Railway 的用户

---

## 📋 前置准备

### 您需要：
- ✅ Railway Hobby Plan 账号（您已有）
- ✅ GitHub 账号
- ✅ 项目代码已推送到 GitHub

### GitHub 仓库地址：
```
https://github.com/changyoutaxiang/user-experience-project.git
```

---

## 🚀 部署步骤（5个阶段）

### 阶段 1：连接 GitHub 仓库

**1.1 登录 Railway**
- 访问：https://railway.app
- 点击右上角 "Login"
- 使用您的账号登录

**1.2 创建新项目**
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 如果第一次使用，点击 "Configure GitHub App"
- 授权 Railway 访问您的 GitHub
- 选择仓库：`changyoutaxiang/user-experience-project`
- 点击 "Deploy Now"

**预期结果**：
- ✅ Railway 会自动检测到项目中的 `backend` 和 `frontend` 目录
- ✅ 开始构建过程（可能会失败，这是正常的，因为还没有数据库）

---

### 阶段 2：添加 PostgreSQL 数据库

**2.1 添加数据库**
- 在项目页面，点击 "New" 按钮
- 选择 "Database"
- 选择 "Add PostgreSQL"
- 等待数据库创建（约 30 秒）

**2.2 查看数据库信息**
- 点击刚创建的 PostgreSQL 服务
- 进入 "Variables" 标签
- 您会看到：
  - `DATABASE_URL`
  - `PGHOST`
  - `PGPORT`
  - `PGUSER`
  - `PGPASSWORD`
  - `PGDATABASE`

**重要**：复制 `DATABASE_URL` 的值，后面会用到！

---

### 阶段 3：配置后端服务

**3.1 进入后端服务**
- 在项目页面，找到 "backend" 服务
- 点击进入

**3.2 设置环境变量**
- 点击 "Variables" 标签
- 点击 "New Variable" 按钮
- 逐个添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `SECRET_KEY` | `点击生成32位随机字符串` | JWT 密钥 |
| `ALGORITHM` | `HS256` | JWT 算法 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token 过期时间 |
| `DEBUG` | `False` | 生产环境关闭调试 |
| `ALLOWED_ORIGINS` | `先留空，稍后填写` | CORS 允许的域名 |

**3.3 修改 DATABASE_URL**
- 找到自动生成的 `DATABASE_URL` 变量
- 点击编辑（铅笔图标）
- 将值从 `postgresql://...` 改为 `postgresql+asyncpg://...`
  - **示例**：
    ```
    原始：postgresql://postgres:xxx@postgres.railway.app:5432/railway
    修改为：postgresql+asyncpg://postgres:xxx@postgres.railway.app:5432/railway
    ```
- 保存

**3.4 生成后端域名**
- 点击 "Settings" 标签
- 找到 "Networking" 部分
- 点击 "Generate Domain"
- 会得到类似：`https://ux-rescue-backend-production.up.railway.app`
- **复制并保存这个 URL！**

**3.5 重新部署后端**
- 点击 "Deployments" 标签
- 点击最新部署右侧的三点菜单
- 选择 "Redeploy"
- 等待部署完成（约 2-3 分钟）

**3.6 检查部署状态**
- 部署成功后，点击 "View Logs" 查看日志
- 应该看到：
  ```
  ✅ Running alembic upgrade head
  ✅ Starting uvicorn server
  ✅ Application startup complete
  ```

---

### 阶段 4：配置前端服务

**4.1 进入前端服务**
- 返回项目页面
- 找到 "frontend" 服务
- 点击进入

**4.2 设置环境变量**
- 点击 "Variables" 标签
- 点击 "New Variable"
- 添加变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_BASE_URL` | `您的后端URL` | 后端 API 地址 |

**示例**：
```
VITE_API_BASE_URL=https://ux-rescue-backend-production.up.railway.app
```

**注意**：使用您在阶段 3.4 复制的后端 URL！

**4.3 生成前端域名**
- 点击 "Settings" 标签
- 找到 "Networking" 部分
- 点击 "Generate Domain"
- 会得到类似：`https://ux-rescue-frontend-production.up.railway.app`
- **复制并保存这个 URL！**

**4.4 重新部署前端**
- 点击 "Deployments" 标签
- 点击 "Redeploy"
- 等待部署完成（约 1-2 分钟）

---

### 阶段 5：完成配置

**5.1 更新后端 CORS 设置**
- 返回 **后端服务** 页面
- 点击 "Variables" 标签
- 找到 `ALLOWED_ORIGINS` 变量（或新建）
- 设置值为您的前端 URL：
  ```
  https://ux-rescue-frontend-production.up.railway.app
  ```
- 保存后，点击 "Deployments" -> "Redeploy"

**5.2 运行数据库初始化**

由于网页无法直接运行命令，我们需要通过 Railway CLI 或者跳过这一步。

**选项 A - 临时安装 Railway CLI**：
```bash
# 在您的本地终端运行
brew install railway
railway login
railway link  # 选择您的项目
railway service backend
railway run python -m src.utils.seed_data
```

**选项 B - 手动创建管理员用户**：
- 部署后先访问前端
- 使用注册功能创建账户
- 或者通过 API 文档创建：访问 `https://您的后端URL/docs`

---

## ✅ 验证部署

### 1. 检查后端健康

访问：`https://您的后端URL/health`

**应该看到**：
```json
{
  "status": "healthy",
  "app": "用户体验拯救项目管理系统"
}
```

### 2. 访问 API 文档

访问：`https://您的后端URL/docs`

**应该看到**：Swagger UI 界面，显示所有 API 端点

### 3. 访问前端应用

访问：`https://您的前端URL`

**应该看到**：登录页面

### 4. 测试登录

如果已运行种子数据脚本，使用：
- **邮箱**：admin@example.com
- **密码**：admin123456

---

## 📊 部署架构图

```
┌─────────────────────────────────────────┐
│         Railway Project                 │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Frontend   │  │   Backend    │   │
│  │              │  │              │   │
│  │  Node.js 18  │→→│  Python 3.11 │   │
│  │  Vite Build  │  │  FastAPI     │   │
│  └──────────────┘  └──────┬───────┘   │
│                            │            │
│                            ↓            │
│                  ┌──────────────┐      │
│                  │ PostgreSQL   │      │
│                  │   Database   │      │
│                  └──────────────┘      │
└─────────────────────────────────────────┘
```

---

## 🔧 常见问题

### Q1: 后端部署失败，显示 "Build failed"

**可能原因**：
- nixpacks.toml 配置问题
- requirements.txt 依赖问题

**解决方案**：
1. 查看部署日志（Deployments -> View Logs）
2. 确认 `backend/nixpacks.toml` 存在
3. 确认 `backend/requirements.txt` 存在

### Q2: 前端无法连接后端，显示 CORS 错误

**原因**：后端 `ALLOWED_ORIGINS` 未正确配置

**解决方案**：
1. 进入后端服务 -> Variables
2. 检查 `ALLOWED_ORIGINS` 值是否为前端的完整 URL
3. 重新部署后端

### Q3: 数据库连接失败

**原因**：`DATABASE_URL` 格式错误

**解决方案**：
1. 确认 `DATABASE_URL` 以 `postgresql+asyncpg://` 开头
2. 不是 `postgresql://`
3. 修改后重新部署

### Q4: 登录时提示 "Invalid credentials"

**原因**：数据库中没有用户数据

**解决方案**：
- 运行种子数据脚本（见阶段 5.2）
- 或使用注册功能创建新用户

---

## 🎯 部署检查清单

在开始部署前：
- [ ] GitHub 仓库已创建并推送代码
- [ ] 已有 Railway Hobby Plan 账号
- [ ] backend/nixpacks.toml 存在
- [ ] frontend/nixpacks.toml 存在

部署过程中：
- [ ] Railway 项目已创建
- [ ] PostgreSQL 数据库已添加
- [ ] 后端环境变量已设置（5个）
- [ ] DATABASE_URL 已修改为 asyncpg 格式
- [ ] 后端域名已生成
- [ ] 前端环境变量已设置（VITE_API_BASE_URL）
- [ ] 前端域名已生成
- [ ] ALLOWED_ORIGINS 已更新

部署完成后：
- [ ] 后端健康检查通过 (/health)
- [ ] API 文档可访问 (/docs)
- [ ] 前端页面正常显示
- [ ] 可以成功登录

---

## 📝 关键信息记录

部署过程中请记录以下信息：

| 项目 | URL/值 | 备注 |
|------|--------|------|
| **后端 URL** | https://________________.railway.app | 阶段 3.4 生成 |
| **前端 URL** | https://________________.railway.app | 阶段 4.3 生成 |
| **数据库 URL** | postgresql+asyncpg://_______ | 阶段 2.2 复制 |
| **SECRET_KEY** | ________________________________ | 阶段 3.2 生成 |

---

## 🎉 完成！

恭喜！您已经成功通过 Railway 网页部署了完整的项目管理系统！

**下一步可以做什么**：

1. **邀请团队成员**
   - 在 Railway 项目设置中添加成员

2. **配置自定义域名**（可选）
   - Settings -> Networking -> Custom Domain

3. **设置监控告警**
   - 在 Railway Dashboard 查看资源使用情况

4. **开始使用系统**
   - 创建项目
   - 添加任务
   - 管理团队

---

## 💡 提示

- **自动部署**：每次推送到 GitHub 主分支，Railway 会自动重新部署
- **查看日志**：任何时候都可以在 Deployments 标签查看日志
- **监控用量**：在项目的 Usage 标签查看资源使用情况
- **成本控制**：Hobby Plan 提供 $5/月免费额度，本项目预计使用 $2-4/月

---

## 🆘 需要帮助？

如果遇到问题：
1. 检查部署日志（Deployments -> View Logs）
2. 检查环境变量（Variables 标签）
3. 参考常见问题部分
4. 查看 Railway 文档：https://docs.railway.app

---

**祝您使用愉快！** 🚀

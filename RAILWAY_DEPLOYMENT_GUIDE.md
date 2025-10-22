# Railway 部署指南

本指南将带您一步一步完成用户体验拯救项目管理系统在 Railway 上的部署。

## 目录

- [前置准备](#前置准备)
- [第一步：安装 Railway CLI](#第一步安装-railway-cli)
- [第二步：登录 Railway](#第二步登录-railway)
- [第三步：创建新项目](#第三步创建新项目)
- [第四步：部署 PostgreSQL 数据库](#第四步部署-postgresql-数据库)
- [第五步：部署后端服务](#第五步部署后端服务)
- [第六步：部署前端服务](#第六步部署前端服务)
- [第七步：配置环境变量](#第七步配置环境变量)
- [第八步：验证部署](#第八步验证部署)
- [常见问题排查](#常见问题排查)
- [维护和更新](#维护和更新)

---

## 前置准备

### 已有条件 ✅
- [x] Railway Hobby Plan 账号
- [x] 项目代码已完成

### 需要准备

- [ ] Git 已安装（用于代码推送）
- [ ] Node.js 已安装（用于 Railway CLI）
- [ ] 确保项目已提交到 Git

**检查 Git 状态**：
```bash
cd /Users/wangdong/Desktop/用户体验拯救
git status
```

**如果有未提交的更改，先提交**：
```bash
git add .
git commit -m "Ready for Railway deployment"
```

---

## 第一步：安装 Railway CLI

### macOS 安装方式

**选项 A：使用 Homebrew（推荐）**
```bash
brew install railway
```

**选项 B：使用 npm**
```bash
npm install -g @railway/cli
```

**选项 C：使用 Shell 脚本**
```bash
curl -fsSL https://railway.app/install.sh | sh
```

### 验证安装

```bash
railway --version
```

**预期输出**：
```
railway version X.X.X
```

---

## 第二步：登录 Railway

### 2.1 启动登录流程

```bash
railway login
```

**会发生什么**：
- 浏览器会自动打开
- 显示 Railway 授权页面
- 点击 "Authorize" 按钮

**预期输出**：
```
🎉 Logged in as your-email@example.com
```

### 2.2 验证登录

```bash
railway whoami
```

**预期输出**：
```
Logged in as your-email@example.com (Your Name)
```

---

## 第三步：创建新项目

### 3.1 创建 Railway 项目

有两种方式：

**方式 A：使用 CLI 创建（推荐）**
```bash
cd /Users/wangdong/Desktop/用户体验拯救
railway init
```

**交互提示**：
```
? Enter project name:
> ux-rescue-pm

? Select a template:
> Empty Project (推荐，我们有自己的配置)
```

**方式 B：在 Railway 网站创建**
1. 访问 https://railway.app
2. 点击 "New Project"
3. 选择 "Empty Project"
4. 命名为 "ux-rescue-pm"

### 3.2 链接本地项目到 Railway

```bash
railway link
```

**交互提示**：
```
? Select a project:
> ux-rescue-pm (刚创建的项目)
```

**预期输出**：
```
✅ Linked to ux-rescue-pm
```

---

## 第四步：部署 PostgreSQL 数据库

### 4.1 添加 PostgreSQL 服务

**使用 CLI**：
```bash
railway add
```

**交互提示**：
```
? Select plugins to add:
> PostgreSQL
```

**或者在网站操作**：
1. 打开项目：https://railway.app/dashboard
2. 点击 "New" -> "Database" -> "Add PostgreSQL"

**预期输出**：
```
✅ PostgreSQL database added
```

### 4.2 获取数据库连接信息

```bash
railway variables
```

**会看到**：
```
DATABASE_URL=postgresql://postgres:xxx@xxx.railway.app:5432/railway
PGHOST=xxx.railway.app
PGPORT=5432
PGUSER=postgres
PGPASSWORD=xxx
PGDATABASE=railway
```

**重要**：记下 `DATABASE_URL`，后面会用到！

---

## 第五步：部署后端服务

### 5.1 创建后端服务

```bash
# 在项目根目录
railway service create backend
```

**或在网站**：
1. 点击 "New" -> "Empty Service"
2. 命名为 "backend"

### 5.2 切换到后端服务

```bash
railway service backend
```

### 5.3 连接 GitHub（如果代码在 GitHub）

**如果代码已在 GitHub**：
1. 在 Railway 网站打开 backend 服务
2. Settings -> Connect Repo
3. 选择您的仓库
4. Root Directory: `/backend`

**如果代码只在本地**：
我们将使用 Railway CLI 直接部署。

### 5.4 配置后端环境变量

**使用 CLI 设置**：

```bash
# 切换到 backend 服务
railway service backend

# 生成安全的 SECRET_KEY
openssl rand -hex 32

# 设置环境变量（用上面生成的密钥替换）
railway variables set SECRET_KEY=your-generated-secret-key-here

# 设置其他变量
railway variables set ALGORITHM=HS256
railway variables set ACCESS_TOKEN_EXPIRE_MINUTES=30
railway variables set DEBUG=False
```

**重要 - 设置数据库连接**：

Railway 会自动提供 `DATABASE_URL`，但我们需要修改为 asyncpg 格式：

```bash
# 获取当前 DATABASE_URL
railway variables

# 复制 DATABASE_URL，将 postgresql:// 改为 postgresql+asyncpg://
# 例如：postgresql://... 改为 postgresql+asyncpg://...

railway variables set DATABASE_URL=postgresql+asyncpg://postgres:xxx@xxx.railway.app:5432/railway
```

**或在网站操作**：
1. 打开 backend 服务
2. Variables 标签
3. 点击 "New Variable"
4. 添加以上变量

### 5.5 部署后端

**方式 A：使用 CLI 部署**
```bash
cd backend
railway up
```

**方式 B：从 GitHub 自动部署**
- 如果已连接 GitHub，push 代码会自动触发部署

### 5.6 查看部署日志

```bash
railway logs
```

**或在网站**：
1. 打开 backend 服务
2. Deployments 标签
3. 查看最新部署的日志

**预期看到**：
```
✅ Running alembic upgrade head
✅ Starting uvicorn server
✅ Application startup complete
```

### 5.7 生成公开域名

**使用 CLI**：
```bash
railway domain
```

**或在网站**：
1. Settings -> Networking
2. Generate Domain

**会得到类似**：
```
https://ux-rescue-backend-production.up.railway.app
```

**记下这个 URL！** 前端需要用到。

---

## 第六步：部署前端服务

### 6.1 创建前端服务

```bash
# 回到项目根目录
cd /Users/wangdong/Desktop/用户体验拯救

# 创建前端服务
railway service create frontend
```

### 6.2 切换到前端服务

```bash
railway service frontend
```

### 6.3 配置前端环境变量

```bash
# 使用刚才的后端 URL
railway variables set VITE_API_BASE_URL=https://ux-rescue-backend-production.up.railway.app
```

**注意**：将 `ux-rescue-backend-production.up.railway.app` 替换为您实际的后端域名！

### 6.4 部署前端

```bash
cd frontend
railway up
```

### 6.5 生成前端域名

```bash
railway domain
```

**会得到类似**：
```
https://ux-rescue-frontend-production.up.railway.app
```

---

## 第七步：配置环境变量

### 7.1 更新后端 CORS 设置

后端需要允许前端域名访问：

```bash
# 切换到 backend 服务
railway service backend

# 设置 ALLOWED_ORIGINS（使用您的前端域名）
railway variables set ALLOWED_ORIGINS=https://ux-rescue-frontend-production.up.railway.app
```

### 7.2 重新部署后端

```bash
cd backend
railway up
```

---

## 第八步：验证部署

### 8.1 检查后端健康

```bash
curl https://ux-rescue-backend-production.up.railway.app/health
```

**预期输出**：
```json
{
  "status": "healthy",
  "app": "用户体验拯救项目管理系统"
}
```

### 8.2 检查 API 文档

在浏览器访问：
```
https://ux-rescue-backend-production.up.railway.app/docs
```

**应该看到**：Swagger UI 界面

### 8.3 访问前端应用

在浏览器访问：
```
https://ux-rescue-frontend-production.up.railway.app
```

**应该看到**：登录页面

### 8.4 测试登录

使用种子数据账号：
- **邮箱**: admin@example.com
- **密码**: admin123456

**注意**：如果数据库是新的，需要先运行种子脚本：

```bash
# 切换到 backend 服务
railway service backend

# 运行种子脚本
railway run python -m src.utils.seed_data
```

---

## 完整部署流程总结

### 快速命令清单

```bash
# 1. 安装 CLI
brew install railway

# 2. 登录
railway login

# 3. 初始化项目
cd /Users/wangdong/Desktop/用户体验拯救
railway init

# 4. 添加数据库
railway add  # 选择 PostgreSQL

# 5. 创建并部署后端
railway service create backend
railway service backend
railway variables set SECRET_KEY=$(openssl rand -hex 32)
railway variables set ALGORITHM=HS256
railway variables set ACCESS_TOKEN_EXPIRE_MINUTES=30
railway variables set DEBUG=False
# 设置 DATABASE_URL（修改为 asyncpg）
cd backend
railway up
railway domain  # 记下后端 URL

# 6. 创建并部署前端
railway service create frontend
railway service frontend
railway variables set VITE_API_BASE_URL=https://your-backend-url.railway.app
cd ../frontend
railway up
railway domain  # 记下前端 URL

# 7. 更新后端 CORS
railway service backend
railway variables set ALLOWED_ORIGINS=https://your-frontend-url.railway.app
cd ../backend
railway up

# 8. 运行数据库种子
railway service backend
railway run python -m src.utils.seed_data
```

---

## 常见问题排查

### 问题 1: 部署失败 - "ModuleNotFoundError"

**原因**: Python 依赖未正确安装

**解决方案**:
```bash
# 确保 requirements.txt 存在
ls backend/requirements.txt

# 检查 railway.toml 配置
cat backend/railway.toml
```

### 问题 2: 数据库连接失败

**原因**: DATABASE_URL 格式不正确

**解决方案**:
```bash
# 检查当前 DATABASE_URL
railway variables

# 确保格式为 postgresql+asyncpg://
railway variables set DATABASE_URL=postgresql+asyncpg://...
```

### 问题 3: CORS 错误

**原因**: 后端未允许前端域名

**解决方案**:
```bash
railway service backend
railway variables set ALLOWED_ORIGINS=https://your-frontend-domain.railway.app
railway up
```

### 问题 4: 前端无法连接后端

**原因**: VITE_API_BASE_URL 未设置

**解决方案**:
```bash
railway service frontend
railway variables set VITE_API_BASE_URL=https://your-backend-domain.railway.app
railway up
```

### 问题 5: 迁移未运行

**原因**: Alembic 迁移失败

**解决方案**:
```bash
railway service backend
railway logs  # 查看错误日志

# 手动运行迁移
railway run alembic upgrade head
```

### 问题 6: 登录失败 - 无用户

**原因**: 数据库中没有用户数据

**解决方案**:
```bash
railway service backend
railway run python -m src.utils.seed_data
```

---

## 查看和管理

### 查看所有服务

```bash
railway status
```

### 查看日志

```bash
# 实时日志
railway logs

# 查看特定服务
railway service backend
railway logs
```

### 查看环境变量

```bash
railway variables
```

### 打开 Railway 网站仪表板

```bash
railway open
```

---

## 维护和更新

### 更新代码

**如果使用 GitHub 连接**:
```bash
git add .
git commit -m "Update feature"
git push
# Railway 会自动检测并部署
```

**如果使用 CLI 部署**:
```bash
cd backend  # 或 frontend
railway up
```

### 重新启动服务

```bash
railway service backend
railway restart
```

### 查看部署历史

在 Railway 网站：
1. 打开服务
2. Deployments 标签
3. 查看所有部署历史

### 回滚到之前版本

在 Railway 网站：
1. Deployments -> 选择历史版本
2. 点击 "Redeploy"

---

## 成本估算

### Hobby Plan 限制

- **免费额度**: $5/月
- **使用量计费**: 超出后按使用量付费
- **资源限制**:
  - 512MB RAM per service
  - Shared CPU

### 本项目预估

- **PostgreSQL**: ~$0.50-1/月
- **Backend**: ~$1-2/月
- **Frontend**: ~$0.50-1/月
- **总计**: ~$2-4/月（在免费额度内）

### 优化成本

1. **使用单个服务**（可选）：
   - 前后端合并部署
   - 降低服务数量

2. **设置休眠**：
   - 非生产环境可设置自动休眠

3. **监控使用量**：
   ```bash
   railway open
   # Usage 标签查看使用情况
   ```

---

## 高级配置

### 自定义域名

1. 在 Railway 项目中打开服务
2. Settings -> Custom Domain
3. 添加您的域名
4. 在域名提供商配置 CNAME

### 环境分离

创建多个环境（开发、生产）：

```bash
railway environment create production
railway environment create staging
```

### 数据库备份

Railway 自动备份，也可手动：

```bash
railway service
# 选择 PostgreSQL
railway backup create
```

---

## 检查清单

部署前检查：

- [ ] Git 仓库已提交所有更改
- [ ] requirements.txt 和 package.json 最新
- [ ] railway.toml 配置正确
- [ ] .env.example 已创建（不提交 .env）

部署后验证：

- [ ] 后端健康检查通过 (`/health`)
- [ ] API 文档可访问 (`/docs`)
- [ ] 前端页面正常加载
- [ ] 数据库连接成功
- [ ] 可以登录和创建数据
- [ ] CORS 正确配置

---

## 下一步

部署成功后，您可以：

1. **配置自定义域名**
2. **设置 CI/CD 自动部署**
3. **配置监控和告警**
4. **邀请团队成员**
5. **开始使用系统！**

---

## 有用的链接

- Railway 文档: https://docs.railway.app
- Railway 社区: https://discord.gg/railway
- 项目仪表板: https://railway.app/dashboard
- CLI 参考: https://docs.railway.app/develop/cli

---

## 需要帮助？

如果遇到问题：

1. 查看日志: `railway logs`
2. 检查变量: `railway variables`
3. 查看状态: `railway status`
4. 访问 Railway Discord 寻求帮助

---

**祝部署顺利！** 🚀

如果有任何问题，随时询问！

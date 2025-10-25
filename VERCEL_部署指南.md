# Vercel + Supabase 部署指南

完整的 FastAPI 后端（40个API端点）+ React 前端部署到 Vercel + Supabase。

## 🏗️ 架构

```
┌─────────────────┐
│   用户浏览器     │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────────────────────┐
│         Vercel                  │
│  ┌─────────┐    ┌────────────┐ │
│  │  前端    │    │ FastAPI    │ │
│  │ (静态)   │    │ Serverless │ │
│  └─────────┘    └──────┬─────┘ │
└─────────────────────────│───────┘
                          │
                          ↓
                 ┌─────────────────┐
                 │ Supabase        │
                 │ PostgreSQL      │
                 └─────────────────┘
```

---

## 📋 部署步骤

### 步骤 1：配置 Supabase 数据库

#### 1.1 获取数据库连接 URL

```bash
# 1. 访问 Supabase Dashboard
https://supabase.com/dashboard

# 2. 选择您的项目（或创建新项目）

# 3. 进入 Settings → Database

# 4. 找到 "Connection string" 部分

# 5. 选择 "URI" 格式

# 6. 复制连接字符串（类似下面的格式）
postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:5432/postgres

# ⚠️ 重要：确保密码已包含在 URL 中！
```

**提示**：
- Connection pooling 模式选择 **Session** 或 **Transaction**
- 推荐使用 **Connection Pooler**（已包含在 URL 中）

---

### 步骤 2：配置 Vercel 环境变量

#### 2.1 通过 Vercel Dashboard 配置

```bash
# 1. 访问 Vercel Dashboard
https://vercel.com/dashboard

# 2. 选择您的项目：user-experience-project

# 3. 进入 Settings → Environment Variables

# 4. 添加以下环境变量（逐个添加）
```

**必需的环境变量**：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://postgres.xxx:xxx@aws-0-xxx.pooler.supabase.com:5432/postgres` | Production, Preview, Development |
| `SECRET_KEY` | `kj5EaY-Ir7sUVfxACc7HnFlNfxGGbhFcYXbNc2Fup1Q` | Production, Preview, Development |
| `ALGORITHM` | `HS256` | Production, Preview, Development |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Production, Preview, Development |
| `ALLOWED_ORIGINS` | `https://user-experience-project.vercel.app,https://*.vercel.app,http://localhost:5173` | Production, Preview, Development |
| `ENVIRONMENT` | `production` | Production |
| `DEBUG` | `false` | Production |
| `VITE_API_BASE_URL` | *(留空)* | Production, Preview, Development |

**重要说明**：
- ✅ `DATABASE_URL`：从 Supabase 复制的完整 URL
- ✅ `SECRET_KEY`：已为您生成，直接使用即可
- ✅ `ALLOWED_ORIGINS`：包含您的 Vercel 域名和通配符
- ✅ `VITE_API_BASE_URL`：留空表示使用相对路径（前后端同域）

#### 2.2 通过命令行配置（可选）

```bash
# 安装 Vercel CLI（如果还没安装）
npm i -g vercel

# 登录
vercel login

# 链接项目
cd /Users/wangdong/Desktop/用户体验拯救
vercel link

# 添加环境变量
vercel env add DATABASE_URL
# 粘贴您的 Supabase 数据库 URL
# 选择环境：Production, Preview, Development (全选)

vercel env add SECRET_KEY
# 输入：kj5EaY-Ir7sUVfxACc7HnFlNfxGGbhFcYXbNc2Fup1Q
# 选择环境：Production, Preview, Development (全选)

# ... 重复添加其他环境变量
```

---

### 步骤 3：初始化 Supabase 数据库

数据库表结构会在首次部署时自动创建（通过 Alembic 迁移）。

**但是**，Vercel Serverless 环境无法运行 Alembic 迁移，所以需要**手动运行迁移**：

#### 3.1 本地运行迁移（推荐）

```bash
# 1. 进入 backend 目录
cd /Users/wangdong/Desktop/用户体验拯救/backend

# 2. 创建虚拟环境（如果还没创建）
python3 -m venv venv
source venv/bin/activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 设置数据库 URL（替换为您的 Supabase URL）
export DATABASE_URL="postgresql://postgres.xxx:xxx@aws-0-xxx.pooler.supabase.com:5432/postgres"

# 5. 运行数据库迁移
alembic upgrade head

# 6. 验证表已创建
# 访问 Supabase Dashboard → Table Editor
# 应该能看到：users, projects, tasks, expenses, audit_logs 等表
```

#### 3.2 通过 Supabase SQL Editor 运行（备选）

如果本地迁移失败，可以手动在 Supabase SQL Editor 中运行迁移脚本：

```bash
# 1. 访问 backend/alembic/versions/ 目录
ls backend/alembic/versions/

# 2. 按时间顺序打开每个迁移文件

# 3. 复制 upgrade() 函数中的 SQL 语句

# 4. 在 Supabase SQL Editor 中执行
```

---

### 步骤 4：部署到 Vercel

#### 4.1 通过 Git 自动部署（推荐）

```bash
# 1. 提交所有更改
git add .
git commit -m "feat: 部署完整 FastAPI 后端到 Vercel Serverless"

# 2. 推送到 GitHub
git push origin main

# 3. Vercel 会自动检测到推送并开始部署
# 访问 https://vercel.com/dashboard 查看部署进度
```

#### 4.2 通过 Vercel CLI 部署

```bash
# 1. 部署到生产环境
vercel --prod

# 2. 等待部署完成
# 应该会输出类似：
# ✅  Production: https://user-experience-project.vercel.app
```

---

### 步骤 5：验证部署

#### 5.1 检查后端 API

```bash
# 1. 健康检查
curl https://user-experience-project.vercel.app/api/health

# 应该返回：
# {"status":"healthy","app":"用户体验拯救项目群管理系统"}

# 2. 访问 API 文档
https://user-experience-project.vercel.app/api/docs

# 应该能看到 40 个 API 端点的完整文档

# 3. 测试注册接口
curl -X POST https://user-experience-project.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "password": "test12345"
  }'

# 应该返回成功响应
```

#### 5.2 检查前端应用

```bash
# 1. 访问前端
https://user-experience-project.vercel.app

# 2. 尝试注册新用户
# 填写表单并提交

# 3. 尝试登录
# 使用刚注册的账号登录

# 4. 打开浏览器 F12 → Network 标签
# 确认：
# - API 请求路径为 /api/v1/...（相对路径）
# - 没有 CORS 错误
# - 请求成功返回 200
```

#### 5.3 检查 Supabase 数据

```bash
# 1. 访问 Supabase Dashboard
https://supabase.com/dashboard

# 2. 进入 Table Editor → users 表

# 3. 应该能看到刚注册的测试用户数据
```

---

## 🔍 故障排查

### 问题 1：API 返回 500 错误

**可能原因**：
- 数据库连接失败
- 环境变量未设置
- 依赖包版本不兼容

**解决方案**：
```bash
# 1. 检查 Vercel 部署日志
vercel logs

# 2. 检查环境变量是否已设置
vercel env ls

# 3. 测试数据库连接
curl https://user-experience-project.vercel.app/api/health/detailed
```

### 问题 2：导入模块失败

**错误信息**：`Failed to import FastAPI application`

**解决方案**：
```bash
# 1. 检查 Vercel 部署日志，查看具体错误

# 2. 确认 backend 目录存在且包含完整代码
ls backend/src/api/

# 3. 检查 api/requirements.txt 是否包含所有依赖
cat api/requirements.txt
```

### 问题 3：数据库表不存在

**错误信息**：`relation "users" does not exist`

**解决方案**：
```bash
# 本地运行数据库迁移（见步骤 3）
cd backend
export DATABASE_URL="your_supabase_url"
alembic upgrade head
```

### 问题 4：CORS 错误

**虽然前后端同域不应该有 CORS 问题，但如果出现：**

**解决方案**：
```bash
# 1. 检查 ALLOWED_ORIGINS 环境变量
vercel env ls | grep ALLOWED_ORIGINS

# 2. 确保包含您的域名
vercel env add ALLOWED_ORIGINS
# 输入：https://user-experience-project.vercel.app,http://localhost:5173
```

---

## 📊 性能优化建议

### 1. Vercel Serverless 优化

- ✅ 已配置 `maxDuration: 30` 秒（适合数据库查询）
- ✅ 使用 Mangum 的 `lifespan="off"` 避免启动延迟
- 建议：监控冷启动时间，考虑使用 Vercel Pro 的 Edge Functions

### 2. Supabase 优化

- ✅ 使用 Connection Pooler（已包含在 URL 中）
- 建议：启用 Supabase 的 Row Level Security (RLS)
- 建议：为常用查询添加数据库索引

### 3. 前端优化

- ✅ Vite 构建已优化代码分割
- 建议：使用 React.lazy() 懒加载路由
- 建议：启用 Vercel Analytics 监控性能

---

## 💰 成本估算

**免费额度**：
- Vercel Hobby：免费（100GB 带宽/月，无限请求）
- Supabase Free：免费（500MB 数据库，50,000 月活用户）

**预计成本**：
- 小型项目（< 10,000 用户）：**$0/月**
- 中型项目（10,000-50,000 用户）：**$0-25/月**（可能需要 Supabase Pro）
- 大型项目（> 50,000 用户）：**$45-85/月**（Vercel Pro $20 + Supabase Pro $25 + 超额费用）

---

## ✅ 部署检查清单

- [ ] Supabase 数据库已创建
- [ ] 从 Supabase 复制了数据库连接 URL
- [ ] 在 Vercel 设置了所有必需的环境变量
- [ ] 本地运行了 Alembic 数据库迁移
- [ ] 代码已提交并推送到 GitHub
- [ ] Vercel 自动部署成功
- [ ] `/api/health` 返回正常
- [ ] `/api/docs` 显示 40 个端点
- [ ] 前端可以正常注册和登录
- [ ] Supabase 数据库中有新用户数据

---

## 🚀 下一步

部署成功后，您可以：

1. **配置自定义域名**
   - Vercel Dashboard → Domains → Add Domain

2. **启用 Supabase Auth**（可选）
   - 集成社交登录（Google, GitHub等）
   - 启用邮箱验证

3. **监控和分析**
   - Vercel Analytics
   - Supabase Dashboard 的实时查询监控

4. **持续集成/部署**
   - 配置 GitHub Actions
   - 添加自动化测试

---

## 📚 相关文档

- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)
- [Mangum Documentation](https://mangum.io/)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

**祝部署顺利！🎉**

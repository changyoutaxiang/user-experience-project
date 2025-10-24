# 如何配置 Vercel 环境变量

## ⚠️ 重要说明

**Vercel 不会自动读取项目中的 `.env.local` 文件！**

您需要通过以下方式之一配置环境变量：

---

## 方法一：通过 Vercel Dashboard（推荐，最简单）

### 后端环境变量配置

1. 在 Vercel 创建项目时，找到 **Environment Variables** 部分
2. 打开 `backend/.env.local` 文件
3. 逐个复制并添加：

| Variable Name | Value |
|--------------|-------|
| `APP_NAME` | `用户体验拯救项目群管理系统` |
| `DEBUG` | `False` |
| `DATABASE_URL` | `postgresql+asyncpg://postgres.djgmecfoecjkfqhieavg:Purina5810@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres` |
| `SUPABASE_URL` | `https://djgmecfoecjkfqhieavg.supabase.co` |
| `SUPABASE_ANON_KEY` | (从 `.env.local` 复制) |
| `SUPABASE_SERVICE_ROLE_KEY` | (从 `.env.local` 复制) |
| `SECRET_KEY` | `b0c1ac5c1a5a92aa98ad9179f2f1e042eaaf7746cddcce7895a920e76f6da354` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |

### 前端环境变量配置

1. 创建前端项目时，找到 **Environment Variables** 部分
2. 打开 `frontend/.env.local` 文件
3. 添加以下变量：

| Variable Name | Value |
|--------------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.vercel.app` ⚠️ 替换为实际后端 URL |
| `VITE_DEBUG` | `false` |
| `VITE_SUPABASE_URL` | `https://djgmecfoecjkfqhieavg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | (从 `.env.local` 复制) |

---

## 方法二：使用 Vercel CLI（自动化）

如果您已经安装了 Vercel CLI，可以更快速地配置环境变量。

### 安装 Vercel CLI

```bash
npm install -g vercel
```

### 登录 Vercel

```bash
vercel login
```

### 配置后端环境变量

```bash
# 进入 backend 目录
cd backend

# 初始化 Vercel 项目（如果还没有）
vercel

# 从 .env.local 添加环境变量到 Vercel
# 注意：需要逐个添加
vercel env add APP_NAME production
# 输入值：用户体验拯救项目群管理系统

vercel env add DEBUG production
# 输入值：False

vercel env add DATABASE_URL production
# 输入值：postgresql+asyncpg://postgres.djgmecfoecjkfqhieavg:Purina5810@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres

# ... 继续添加其他变量
```

### 配置前端环境变量

```bash
# 进入 frontend 目录
cd ../frontend

# 初始化 Vercel 项目
vercel

# 添加环境变量
vercel env add VITE_API_BASE_URL production
# 输入值：https://your-backend.vercel.app

vercel env add VITE_DEBUG production
# 输入值：false

vercel env add VITE_SUPABASE_URL production
# 输入值：https://djgmecfoecjkfqhieavg.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# 输入值：(从 .env.local 复制)
```

---

## 方法三：批量导入（使用脚本）

如果您想一次性导入所有环境变量，可以使用以下脚本：

### 后端环境变量批量导入

```bash
cd backend

# 从 .env.local 批量导入（需要先安装 vercel CLI）
while IFS='=' read -r key value; do
  # 跳过注释和空行
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z $key ]] && continue

  # 添加到 Vercel
  echo "$value" | vercel env add "$key" production
done < .env.local
```

### 前端环境变量批量导入

```bash
cd frontend

# 从 .env.local 批量导入
while IFS='=' read -r key value; do
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z $key ]] && continue

  echo "$value" | vercel env add "$key" production
done < .env.local
```

---

## 验证环境变量

### 在 Vercel Dashboard 验证

1. 进入项目设置
2. **Settings** > **Environment Variables**
3. 确认所有变量都已添加

### 使用 CLI 验证

```bash
# 查看后端环境变量
cd backend
vercel env ls

# 查看前端环境变量
cd frontend
vercel env ls
```

---

## 📋 环境变量清单

### 后端需要的环境变量（10 个）

- [x] `APP_NAME`
- [x] `DEBUG`
- [x] `DATABASE_URL`
- [x] `SUPABASE_URL`
- [x] `SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY`
- [x] `SECRET_KEY`
- [x] `ALGORITHM`
- [x] `ACCESS_TOKEN_EXPIRE_MINUTES`
- [x] `ALLOWED_ORIGINS`

### 前端需要的环境变量（4 个）

- [x] `VITE_API_BASE_URL`
- [x] `VITE_DEBUG`
- [x] `VITE_SUPABASE_URL`
- [x] `VITE_SUPABASE_ANON_KEY`

---

## ⚠️ 重要提醒

1. **不要提交 `.env.local` 到 Git**
   - 这些文件已在 `.gitignore` 中
   - 它们包含敏感信息（密码、密钥）

2. **更新占位符值**
   - 后端的 `ALLOWED_ORIGINS`：前端部署后更新
   - 前端的 `VITE_API_BASE_URL`：后端部署后更新

3. **环境变量修改后需要重新部署**
   - 在 Vercel Dashboard 修改环境变量后
   - 需要触发重新部署才能生效

---

## 🎯 推荐流程

1. **先部署后端**
   - 使用方法一（Dashboard）配置环境变量
   - `ALLOWED_ORIGINS` 先用占位符
   - 部署并记录后端 URL

2. **再部署前端**
   - 配置环境变量
   - `VITE_API_BASE_URL` 使用后端 URL
   - 部署并记录前端 URL

3. **更新后端 CORS**
   - 更新后端的 `ALLOWED_ORIGINS`
   - 重新部署后端

---

## 需要帮助？

如果遇到问题：
- 查看 [Vercel环境变量配置指南.md](./Vercel环境变量配置指南.md)
- 查看 [Vercel 官方文档](https://vercel.com/docs/concepts/projects/environment-variables)

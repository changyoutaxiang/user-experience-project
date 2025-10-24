# 使用 Vercel Import .env 功能快速部署

## 🎉 好消息！

Vercel 现在支持直接导入 `.env` 文件，可以一键批量配置所有环境变量！

---

## 📁 使用哪个文件？

我已经为您准备好了专门用于 Vercel Import 功能的文件：

### 后端部署使用
📄 **`backend/.env.vercel`**
- 包含所有 10 个后端环境变量
- 纯净的 KEY=VALUE 格式（无注释）
- 可直接用于 Vercel Import 功能

### 前端部署使用
📄 **`frontend/.env.vercel`**
- 包含所有 4 个前端环境变量
- 纯净的 KEY=VALUE 格式（无注释）
- 可直接用于 Vercel Import 功能

---

## 🚀 部署步骤（超级简单）

### 第一步：部署后端

1. **登录 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard

2. **创建新项目**
   - 点击 **Add New** > **Project**
   - 选择您的 GitHub 仓库

3. **配置项目**
   - **Project Name**: `ux-rescue-backend`（或您喜欢的名称）
   - **Framework Preset**: Other
   - **Root Directory**: 点击 **Edit**，选择 `backend`

4. **导入环境变量** 🌟
   - 展开 **Environment Variables** 部分
   - 点击 **Import .env** 按钮
   - 选择或拖拽 **`backend/.env.vercel`** 文件
   - Vercel 会自动解析并填充所有 10 个环境变量！

5. **部署**
   - 点击 **Deploy** 按钮
   - 等待 2-5 分钟
   - ✅ **记录后端 URL**（例如：`https://ux-rescue-backend.vercel.app`）

---

### 第二步：部署前端

1. **创建前端项目**
   - 在 Vercel Dashboard，点击 **Add New** > **Project**
   - 选择同一个 GitHub 仓库

2. **配置项目**
   - **Project Name**: `ux-rescue-frontend`
   - **Framework Preset**: 自动检测为 **Vite** ✅
   - **Root Directory**: 点击 **Edit**，选择 `frontend`

3. **更新 .env.vercel 文件** ⚠️ 重要！

   **在导入前，先编辑 `frontend/.env.vercel`**：

   ```bash
   # 打开文件
   code frontend/.env.vercel

   # 或使用任何编辑器
   # 将第一行改为：
   VITE_API_BASE_URL=https://your-backend.vercel.app

   # 替换为实际的后端 URL，例如：
   VITE_API_BASE_URL=https://ux-rescue-backend.vercel.app
   ```

4. **导入环境变量** 🌟
   - 展开 **Environment Variables** 部分
   - 点击 **Import .env** 按钮
   - 选择更新后的 **`frontend/.env.vercel`** 文件
   - 验证 `VITE_API_BASE_URL` 是正确的后端 URL

5. **部署**
   - 点击 **Deploy** 按钮
   - 等待 2-5 分钟
   - ✅ **记录前端 URL**（例如：`https://ux-rescue-frontend.vercel.app`）

---

### 第三步：更新后端 CORS

1. **回到后端项目**
   - 在 Vercel Dashboard 选择后端项目

2. **更新环境变量**
   - 进入 **Settings** > **Environment Variables**
   - 找到 `ALLOWED_ORIGINS` 变量
   - 点击编辑（铅笔图标）
   - 将值改为前端 URL：
     ```
     https://ux-rescue-frontend.vercel.app
     ```

3. **重新部署**
   - 进入 **Deployments** 标签
   - 找到最新的部署
   - 点击右侧三个点 **···** > **Redeploy**

---

## ✅ 验证部署

### 测试后端

访问后端 API 文档：
```
https://your-backend.vercel.app/docs
```

如果看到 FastAPI Swagger UI 页面，说明后端部署成功！✅

### 测试前端

1. 访问前端 URL：
   ```
   https://your-frontend.vercel.app
   ```

2. 使用管理员账号登录：
   - **邮箱**: `admin@example.com`
   - **密码**: `admin123456`

3. 测试功能：
   - 查看仪表板
   - 创建项目
   - 创建任务
   - 添加支出

如果一切正常，恭喜您部署成功！🎉

---

## 📋 环境变量检查清单

### 后端环境变量（10 个）

从 `backend/.env.vercel` 导入后，应该有：

- [x] `APP_NAME`
- [x] `DEBUG`
- [x] `DATABASE_URL`
- [x] `SUPABASE_URL`
- [x] `SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY`
- [x] `SECRET_KEY`
- [x] `ALGORITHM`
- [x] `ACCESS_TOKEN_EXPIRE_MINUTES`
- [x] `ALLOWED_ORIGINS` ⚠️ 需要在前端部署后更新

### 前端环境变量（4 个）

从 `frontend/.env.vercel` 导入后，应该有：

- [x] `VITE_API_BASE_URL` ⚠️ 必须是实际的后端 URL
- [x] `VITE_DEBUG`
- [x] `VITE_SUPABASE_URL`
- [x] `VITE_SUPABASE_ANON_KEY`

---

## 💡 使用 Import .env 功能的优势

✅ **快速**：一键导入 10 个环境变量，无需手动复制粘贴
✅ **准确**：避免手动输入时的拼写错误
✅ **方便**：直接从文件导入，无需在界面上逐个输入
✅ **可重复**：需要重新部署时可以快速重新导入

---

## ⚠️ 重要提醒

### 1. 前端部署前必须更新 API URL

部署前端之前，务必编辑 `frontend/.env.vercel`：

```bash
# ❌ 错误（占位符）
VITE_API_BASE_URL=https://your-backend.vercel.app

# ✅ 正确（实际 URL）
VITE_API_BASE_URL=https://ux-rescue-backend.vercel.app
```

### 2. 后端部署后必须更新 CORS

前端部署完成后，务必回到后端更新 `ALLOWED_ORIGINS`。

### 3. 不要提交 .env.vercel 到 Git

这些文件包含敏感信息，已在 `.gitignore` 中排除。

---

## 🔧 常见问题

### Q1: Import 功能找不到文件？

**解决方案**：
- 确保文件在正确的目录（`backend/.env.vercel` 或 `frontend/.env.vercel`）
- 可以直接复制文件内容，粘贴到 Vercel 的文本框中

### Q2: 导入后某些变量缺失？

**解决方案**：
- 检查文件格式是否正确（每行 `KEY=VALUE`）
- 确保没有空行在变量之间
- 可以手动添加缺失的变量

### Q3: CORS 错误？

**解决方案**：
- 确认后端 `ALLOWED_ORIGINS` 已更新为前端 URL
- 确认已重新部署后端
- 检查前端 `VITE_API_BASE_URL` 是否正确

---

## 📚 相关文件

- **`backend/.env.vercel`** - 后端环境变量（用于 Import）
- **`frontend/.env.vercel`** - 前端环境变量（用于 Import）
- **`backend/.env.local`** - 后端环境变量（带注释，参考用）
- **`frontend/.env.local`** - 前端环境变量（带注释，参考用）
- **`backend/vercel-env-vars.txt`** - 后端环境变量（纯文本）
- **`frontend/vercel-env-vars.txt`** - 前端环境变量（纯文本）

---

## 🎯 总结

使用 Vercel Import .env 功能，您只需：

1. ✅ 准备好 `.env.vercel` 文件（已完成）
2. ✅ 部署后端 → 点击 Import → 选择 `backend/.env.vercel`
3. ✅ 更新前端的 API URL
4. ✅ 部署前端 → 点击 Import → 选择 `frontend/.env.vercel`
5. ✅ 更新后端 CORS → 重新部署

整个过程不到 15 分钟！🚀

---

需要帮助？随时告诉我！

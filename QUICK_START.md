# Railway 部署快速开始

> 🚀 5分钟快速部署指南

## 准备工作

✅ 您已有 Railway Hobby Plan 账号

## 三种部署方式

### 🎯 方式一：一键自动脚本（最简单）

```bash
cd /Users/wangdong/Desktop/用户体验拯救
./deploy-to-railway.sh
```

**这个脚本会自动完成**：
- ✅ 检查环境
- ✅ 登录 Railway
- ✅ 创建项目
- ✅ 部署后端和前端
- ✅ 配置环境变量
- ✅ 初始化数据

**您只需要**：
1. 按照提示添加 PostgreSQL 数据库
2. 设置 DATABASE_URL（脚本会告诉您怎么做）

---

### 📖 方式二：跟随详细指南

查看完整的分步指南：
```bash
open RAILWAY_DEPLOYMENT_GUIDE.md
```

这份指南包含：
- 每一步的详细说明
- 截图和预期输出
- 常见问题解决方案
- 成本估算

---

### ⚡ 方式三：命令行快速部署

如果您熟悉命令行，可以直接执行：

```bash
# 1. 安装 CLI
brew install railway

# 2. 登录
railway login

# 3. 初始化项目
railway init

# 4. 在网站添加 PostgreSQL
# 访问 https://railway.app/dashboard
# New -> Database -> PostgreSQL

# 5. 部署后端
railway service create backend
railway service backend
railway variables set SECRET_KEY=$(openssl rand -hex 32)
railway variables set ALGORITHM=HS256
railway variables set ACCESS_TOKEN_EXPIRE_MINUTES=30
railway variables set DEBUG=False
# 手动设置 DATABASE_URL（改为 asyncpg）
cd backend && railway up && railway domain
cd ..

# 6. 部署前端
railway service create frontend
railway service frontend
railway variables set VITE_API_BASE_URL=<后端URL>
cd frontend && railway up && railway domain
cd ..

# 7. 更新 CORS
railway service backend
railway variables set ALLOWED_ORIGINS=<前端URL>
cd backend && railway up

# 8. 初始化数据
railway service backend
railway run python -m src.utils.seed_data
```

---

## 部署后验证

### 1. 检查后端

```bash
# 方法A：命令行
curl https://your-backend-url.railway.app/health

# 方法B：浏览器
# 访问 https://your-backend-url.railway.app/docs
```

### 2. 访问前端

浏览器打开：`https://your-frontend-url.railway.app`

### 3. 测试登录

使用默认账号：
- 管理员：admin@example.com / admin123456
- 成员：zhangsan@example.com / password123

---

## 常见问题

### ❓ 部署失败了怎么办？

```bash
# 查看日志
railway logs

# 检查变量
railway variables

# 重新部署
railway up
```

### ❓ 数据库连接错误

确保 DATABASE_URL 格式正确：
```bash
railway variables

# 应该是 postgresql+asyncpg:// 开头
# 如果是 postgresql://，需要改为 postgresql+asyncpg://
```

### ❓ 前端连不上后端

检查环境变量：
```bash
railway service frontend
railway variables

# VITE_API_BASE_URL 应该是后端的 railway.app 域名
```

### ❓ 登录失败

运行数据种子脚本：
```bash
railway service backend
railway run python -m src.utils.seed_data
```

---

## 有用的命令

```bash
# 查看所有服务状态
railway status

# 查看实时日志
railway logs

# 打开 Railway 网站
railway open

# 查看环境变量
railway variables

# 重启服务
railway restart
```

---

## 下一步

部署成功后：

1. **配置自定义域名**（可选）
   - Railway 网站 -> Settings -> Custom Domain

2. **设置监控**
   - 查看 Usage 标签了解资源使用情况

3. **邀请团队成员**
   - Settings -> Members

4. **开始使用！**
   - 创建项目
   - 添加任务
   - 跟踪支出

---

## 需要帮助？

- 📖 **详细指南**: [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md)
- 🔒 **安全文档**: [SECURITY.md](SECURITY.md)
- 📋 **项目文档**: [README.md](README.md)
- ✅ **完成报告**: [PROJECT_COMPLETION.md](PROJECT_COMPLETION.md)

---

**祝部署顺利！** 🎉

如有问题，可以：
- 查看 Railway 文档: https://docs.railway.app
- 访问 Railway Discord: https://discord.gg/railway
- 或者在项目中提问

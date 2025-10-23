# 安全配置指南

本文档提供生产环境部署的安全配置指南。

## 🔐 后端安全配置

### 1. 生成安全的 SECRET_KEY

**方法 1: Python**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**方法 2: OpenSSL**
```bash
openssl rand -base64 32
```

**方法 3: 使用后端工具**
```bash
cd backend
python -c "from src.core.config import generate_secret_key; print(generate_secret_key())"
```

将生成的密钥设置到环境变量：
```bash
export SECRET_KEY="你生成的密钥"
```

### 2. 环境变量配置

复制生产环境配置模板：
```bash
cp backend/.env.production.example backend/.env
```

**必须配置的环境变量：**

| 变量 | 说明 | 示例 |
|------|------|------|
| `ENVIRONMENT` | 环境标识 | `production` |
| `DATABASE_URL` | 数据库连接 | `postgresql+asyncpg://user:pass@host:5432/db` |
| `SECRET_KEY` | JWT密钥 | 使用上述方法生成 |
| `ALLOWED_ORIGINS` | CORS域名 | `https://yourdomain.com` |

### 3. 数据库安全

**使用 SSL 连接（推荐）：**
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db?ssl=require
```

**配置连接池：**
```python
# backend/src/core/database.py
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # 检测连接健康
    pool_recycle=3600,   # 1小时回收连接
)
```

### 4. 速率限制配置

当前配置（可在 `backend/src/core/middleware.py` 调整）：

```python
# 全局限制: 100次/分钟
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],
)

# 特定端点限制（在路由中添加）
@limiter.limit("5/minute")  # 登录接口更严格
async def login(...):
    ...
```

### 5. 安全响应头

已自动添加的安全头部：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

生产环境还会添加（需手动启用）：
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### 6. CORS 配置

**开发环境：**
```bash
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**生产环境：**
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

⚠️  **禁止在生产环境使用：**
- `allow_origins=["*"]` - 允许所有源
- `localhost` 或 `127.0.0.1`

---

## 🎨 前端安全配置

### 1. 环境变量配置

创建生产环境配置：
```bash
# frontend/.env.production
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 2. XSS 防护

安装 DOMPurify：
```bash
cd frontend
npm install dompurify
npm install --save-dev @types/dompurify
```

使用示例：
```typescript
import DOMPurify from 'dompurify';

// 渲染用户输入前清理
const clean = DOMPurify.sanitize(userInput);
```

### 3. Content Security Policy

在 Nginx 配置中添加（已包含在 `docker/nginx.conf`）：
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
```

### 4. 环境变量验证

前端会自动验证环境变量（`src/config/env.ts`）：
- ✅ 检查必需变量
- ✅ 生产环境禁止 localhost
- ✅ 建议使用 HTTPS

---

## 🐳 Docker 安全配置

### 1. 使用非 root 用户

后端 Dockerfile 已配置（`docker/backend.Dockerfile`）：
```dockerfile
RUN useradd -m -u 1000 appuser
USER appuser
```

### 2. 最小化镜像大小

使用多阶段构建和 Alpine 镜像：
```dockerfile
FROM python:3.11-slim as builder
# ...
FROM python:3.11-slim
# 只复制必需的文件
```

### 3. 健康检查

已配置健康检查：
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"
```

---

## 🔍 安全检查清单

### 部署前检查

- [ ] SECRET_KEY 已生成并设置（至少32字符）
- [ ] DATABASE_URL 使用强密码且配置 SSL
- [ ] ALLOWED_ORIGINS 仅包含实际域名（无 localhost）
- [ ] ENVIRONMENT=production
- [ ] DEBUG=False
- [ ] 前端 API URL 使用 HTTPS
- [ ] 所有默认密码已更改
- [ ] 敏感文件已添加到 .gitignore

### 运行时检查

- [ ] API 返回正确的安全头部
- [ ] CORS 配置生效
- [ ] 速率限制工作正常
- [ ] HTTPS 证书有效
- [ ] 日志记录敏感操作
- [ ] 数据库备份定期执行

---

## 🚨 常见安全问题

### 1. SECRET_KEY 太短或使用默认值

**错误示例：**
```bash
SECRET_KEY=123456  # ❌ 太短
SECRET_KEY=your-secret-key-change-in-production  # ❌ 默认值
```

**正确示例：**
```bash
SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")  # ✅
```

### 2. 生产环境使用 localhost

**错误示例：**
```bash
ALLOWED_ORIGINS=http://localhost:5173  # ❌ 生产环境
VITE_API_BASE_URL=http://localhost:8000  # ❌ 生产环境
```

**正确示例：**
```bash
ALLOWED_ORIGINS=https://yourdomain.com  # ✅
VITE_API_BASE_URL=https://api.yourdomain.com  # ✅
```

### 3. 数据库连接未加密

**错误示例：**
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db  # ❌ 未加密
```

**正确示例：**
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db?ssl=require  # ✅
```

---

## 📚 相关文档

- [SECURITY.md](SECURITY.md) - 安全策略和漏洞报告
- [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md) - Railway 部署指南
- [优化修复规划.md](优化修复规划.md) - 完整优化计划

---

## 🆘 需要帮助？

如果遇到安全配置问题：
1. 检查日志：`docker-compose logs backend`
2. 验证环境变量：`docker-compose config`
3. 测试健康检查：`curl http://localhost:8000/health`
4. 查看安全扫描结果：GitHub Actions Security workflow

---

**最后更新**: 2025-10-23

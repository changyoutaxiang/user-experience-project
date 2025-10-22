# GitHub 仓库设置指南

当前代码已在本地提交，现在需要推送到 GitHub。

## 方法一：在 GitHub 网站创建仓库（推荐）

### 步骤 1: 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `ux-rescue-pm` (或您喜欢的名字)
   - **Description**: "用户体验拯救项目管理系统 - Full-stack PM system with FastAPI + React"
   - **Visibility**:
     - ✅ **Private** (推荐，保护代码私密性)
     - ⚪ Public (开源项目)
   - **初始化选项**: ❌ 全部不勾选
     - ❌ 不添加 README
     - ❌ 不添加 .gitignore
     - ❌ 不选择 license

     > 因为我们本地已有这些文件

3. 点击 **"Create repository"** 按钮

### 步骤 2: 连接远程仓库

创建后，GitHub 会显示设置说明。复制 "push an existing repository" 部分的命令。

**在终端执行**：

```bash
# 添加远程仓库（替换为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/ux-rescue-pm.git

# 或使用 SSH（推荐，需要先配置 SSH 密钥）
# git remote add origin git@github.com:YOUR_USERNAME/ux-rescue-pm.git

# 推送代码到主分支
git push -u origin 001-ux-rescue-pm-system
```

**如果提示输入凭据**：
- 用户名: 您的 GitHub 用户名
- 密码: Personal Access Token（不是登录密码）

> **注意**: GitHub 已不支持密码登录，需要使用 Personal Access Token

---

## 方法二：使用 GitHub CLI（更快）

如果您安装了 GitHub CLI：

```bash
# 安装 GitHub CLI（如果还没安装）
brew install gh

# 登录
gh auth login

# 创建远程仓库并推送
gh repo create ux-rescue-pm --private --source=. --remote=origin --push
```

---

## 创建 Personal Access Token（如果需要）

如果使用 HTTPS 且没有 Token：

1. 访问 https://github.com/settings/tokens
2. 点击 **"Generate new token"** -> **"Generate new token (classic)"**
3. 设置：
   - **Note**: "UX Rescue PM System"
   - **Expiration**: 90 days (或更长)
   - **Scopes**: 勾选 `repo` (完整仓库权限)
4. 点击 **"Generate token"**
5. **立即复制** Token（只显示一次！）
6. 在 git push 时使用这个 Token 作为密码

---

## 验证推送成功

推送完成后：

```bash
# 查看远程仓库
git remote -v

# 应该看到：
# origin  https://github.com/YOUR_USERNAME/ux-rescue-pm.git (fetch)
# origin  https://github.com/YOUR_USERNAME/ux-rescue-pm.git (push)
```

在浏览器访问您的仓库查看代码：
```
https://github.com/YOUR_USERNAME/ux-rescue-pm
```

---

## 推送后的 Railway 部署

代码推送到 GitHub 后，Railway 部署会更简单：

### 选项 A: Railway CLI 自动检测
```bash
railway up
# Railway 会自动检测 GitHub 仓库并部署
```

### 选项 B: 在 Railway 网站连接 GitHub
1. 打开 Railway 项目
2. 在 backend/frontend 服务中
3. Settings -> Connect Repo
4. 选择您的 GitHub 仓库
5. 设置 Root Directory:
   - Backend: `/backend`
   - Frontend: `/frontend`

**优势**：
- ✅ 每次 git push 自动部署
- ✅ 部署历史记录
- ✅ 一键回滚
- ✅ 分支预览

---

## 快速命令参考

```bash
# 1. 查看当前状态
git status
git log --oneline -5

# 2. 添加远程仓库（替换用户名）
git remote add origin https://github.com/YOUR_USERNAME/ux-rescue-pm.git

# 3. 推送代码
git push -u origin 001-ux-rescue-pm-system

# 4. 后续推送（已设置上游）
git push

# 5. 查看远程分支
git branch -r

# 6. 创建主分支并推送（可选）
git checkout -b main
git merge 001-ux-rescue-pm-system
git push -u origin main
```

---

## 常见问题

### Q: 推送时要求输入密码但不接受？
A: GitHub 不再支持密码，需要使用 Personal Access Token。参考上面的创建方法。

### Q: 如何保存凭据避免重复输入？
A: 使用凭据管理器：
```bash
# macOS
git config --global credential.helper osxkeychain

# Linux
git config --global credential.helper store
```

### Q: SSH 方式更安全吗？
A: 是的，推荐使用 SSH。配置方法：
```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 添加到 ssh-agent
ssh-add ~/.ssh/id_ed25519

# 复制公钥
cat ~/.ssh/id_ed25519.pub

# 添加到 GitHub: https://github.com/settings/ssh/new
```

### Q: 想修改远程仓库地址？
```bash
# 查看当前远程
git remote -v

# 修改远程 URL
git remote set-url origin NEW_URL

# 删除远程
git remote remove origin
```

---

## 下一步

推送成功后：

1. ✅ 代码已安全备份到 GitHub
2. ✅ 可以开始 Railway 部署
3. ✅ 可以邀请协作者
4. ✅ 可以设置 CI/CD

**现在可以运行**：
```bash
./deploy-to-railway.sh
```

开始部署到 Railway！🚀

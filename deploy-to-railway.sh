#!/bin/bash

# Railway 自动部署脚本
# 用户体验拯救项目管理系统

set -e  # 遇到错误立即退出

echo "🚀 用户体验拯救 - Railway 部署脚本"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 步骤计数器
STEP=1

print_step() {
    echo ""
    echo "${BLUE}步骤 $STEP: $1${NC}"
    echo "--------------------------------------"
    STEP=$((STEP + 1))
}

print_success() {
    echo "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo "${RED}❌ $1${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ==================== 第一步：环境检查 ====================
print_step "环境检查"

# 检查 Railway CLI
if command_exists railway; then
    RAILWAY_VERSION=$(railway --version)
    print_success "Railway CLI 已安装: $RAILWAY_VERSION"
else
    print_error "Railway CLI 未安装"
    echo ""
    echo "请选择安装方式："
    echo "1. Homebrew (推荐): brew install railway"
    echo "2. npm: npm install -g @railway/cli"
    echo "3. Shell: curl -fsSL https://railway.app/install.sh | sh"
    echo ""
    read -p "安装完成后按回车继续..."
    exit 1
fi

# 检查 Git
if command_exists git; then
    print_success "Git 已安装"
else
    print_error "Git 未安装，请先安装 Git"
    exit 1
fi

# 检查 openssl（用于生成密钥）
if command_exists openssl; then
    print_success "OpenSSL 已安装"
else
    print_warning "OpenSSL 未安装，将使用默认密钥"
fi

# ==================== 第二步：登录验证 ====================
print_step "验证 Railway 登录状态"

if railway whoami >/dev/null 2>&1; then
    RAILWAY_USER=$(railway whoami)
    print_success "已登录: $RAILWAY_USER"
else
    print_warning "未登录 Railway"
    echo "正在打开登录页面..."
    railway login

    if railway whoami >/dev/null 2>&1; then
        print_success "登录成功!"
    else
        print_error "登录失败"
        exit 1
    fi
fi

# ==================== 第三步：项目配置 ====================
print_step "配置 Railway 项目"

# 检查是否已链接项目
if railway status >/dev/null 2>&1; then
    print_warning "项目已链接到 Railway"
    read -p "是否继续使用当前项目？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "请手动运行: railway link"
        exit 1
    fi
else
    echo "创建新项目还是链接现有项目？"
    echo "1. 创建新项目 (推荐)"
    echo "2. 链接现有项目"
    read -p "请选择 (1/2): " -n 1 -r
    echo

    if [[ $REPLY == "1" ]]; then
        read -p "请输入项目名称 (默认: ux-rescue-pm): " PROJECT_NAME
        PROJECT_NAME=${PROJECT_NAME:-ux-rescue-pm}
        railway init --name "$PROJECT_NAME"
        print_success "项目创建成功: $PROJECT_NAME"
    else
        railway link
        print_success "项目链接成功"
    fi
fi

# ==================== 第四步：添加 PostgreSQL ====================
print_step "添加 PostgreSQL 数据库"

echo "请在 Railway 网站手动添加 PostgreSQL:"
echo "1. 访问: https://railway.app/dashboard"
echo "2. 打开您的项目"
echo "3. 点击 'New' -> 'Database' -> 'Add PostgreSQL'"
echo ""
read -p "添加完成后按回车继续..."

print_success "PostgreSQL 已添加"

# ==================== 第五步：生成密钥 ====================
print_step "生成安全密钥"

if command_exists openssl; then
    SECRET_KEY=$(openssl rand -hex 32)
    print_success "已生成 SECRET_KEY"
else
    SECRET_KEY="your-secret-key-please-change-this-in-production-$(date +%s)"
    print_warning "使用默认 SECRET_KEY，建议手动更改"
fi

echo "SECRET_KEY: $SECRET_KEY"
echo ""

# ==================== 第六步：部署后端 ====================
print_step "部署后端服务"

echo "正在创建 backend 服务..."
railway service create backend 2>/dev/null || print_warning "backend 服务可能已存在"

railway service backend

echo "正在设置后端环境变量..."
railway variables set SECRET_KEY="$SECRET_KEY"
railway variables set ALGORITHM="HS256"
railway variables set ACCESS_TOKEN_EXPIRE_MINUTES="30"
railway variables set DEBUG="False"

print_success "环境变量已设置"

echo ""
echo "${YELLOW}重要！需要手动设置 DATABASE_URL:${NC}"
echo "1. 运行: railway variables"
echo "2. 复制 DATABASE_URL 的值"
echo "3. 将 postgresql:// 改为 postgresql+asyncpg://"
echo "4. 运行: railway variables set DATABASE_URL=postgresql+asyncpg://..."
echo ""
read -p "设置完成后按回车继续..."

echo "正在部署后端..."
cd backend
railway up

print_success "后端部署已开始"

echo "正在生成后端域名..."
BACKEND_URL=$(railway domain 2>/dev/null || echo "")

if [ -z "$BACKEND_URL" ]; then
    echo "请手动生成后端域名："
    echo "运行: railway domain"
    echo ""
    read -p "请输入后端域名 (https://xxx.railway.app): " BACKEND_URL
else
    print_success "后端域名: $BACKEND_URL"
fi

cd ..

# ==================== 第七步：部署前端 ====================
print_step "部署前端服务"

echo "正在创建 frontend 服务..."
railway service create frontend 2>/dev/null || print_warning "frontend 服务可能已存在"

railway service frontend

echo "正在设置前端环境变量..."
railway variables set VITE_API_BASE_URL="$BACKEND_URL"

print_success "环境变量已设置"

echo "正在部署前端..."
cd frontend
railway up

print_success "前端部署已开始"

echo "正在生成前端域名..."
FRONTEND_URL=$(railway domain 2>/dev/null || echo "")

if [ -z "$FRONTEND_URL" ]; then
    echo "请手动生成前端域名："
    echo "运行: railway domain"
    echo ""
    read -p "请输入前端域名 (https://xxx.railway.app): " FRONTEND_URL
else
    print_success "前端域名: $FRONTEND_URL"
fi

cd ..

# ==================== 第八步：更新 CORS ====================
print_step "配置 CORS"

echo "正在更新后端 CORS 设置..."
railway service backend
railway variables set ALLOWED_ORIGINS="$FRONTEND_URL"

print_success "CORS 已配置"

echo "重新部署后端以应用 CORS 设置..."
cd backend
railway up
cd ..

# ==================== 第九步：运行数据库种子 ====================
print_step "初始化数据库数据"

echo "等待后端部署完成..."
sleep 10

echo "正在运行数据库种子脚本..."
railway service backend
railway run python -m src.utils.seed_data || print_warning "种子脚本运行失败，请手动运行"

print_success "数据库初始化完成"

# ==================== 部署完成 ====================
echo ""
echo "======================================"
echo "${GREEN}🎉 部署完成！${NC}"
echo "======================================"
echo ""
echo "${BLUE}访问信息:${NC}"
echo "前端地址: $FRONTEND_URL"
echo "后端地址: $BACKEND_URL"
echo "API 文档: $BACKEND_URL/docs"
echo ""
echo "${BLUE}默认账号:${NC}"
echo "管理员: admin@example.com / admin123456"
echo "成员: zhangsan@example.com / password123"
echo ""
echo "${BLUE}下一步:${NC}"
echo "1. 访问前端地址进行测试"
echo "2. 在 Railway 网站配置自定义域名（可选）"
echo "3. 查看日志: railway logs"
echo "4. 查看状态: railway status"
echo ""
echo "${YELLOW}重要提醒:${NC}"
echo "- 请在 Railway 网站检查服务状态"
echo "- 如果遇到问题，运行: railway logs"
echo "- 详细文档: RAILWAY_DEPLOYMENT_GUIDE.md"
echo ""
echo "🚀 开始使用您的项目管理系统吧！"

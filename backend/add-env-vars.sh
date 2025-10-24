#!/bin/bash

# 为 user-experience-project 后端项目添加环境变量
PROJECT="user-experience-project"
SCOPE="changyoutaxiangs-projects"

echo "开始为 $PROJECT 添加环境变量..."

# 添加 DATABASE_URL
echo "postgresql+asyncpg://postgres.djgmecfoecjkfqhieavg:Purina5810@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres" | \
  vercel env add DATABASE_URL production --scope $SCOPE --yes

# 添加 SECRET_KEY
echo "b0c1ac5c1a5a92aa98ad9179f2f1e042eaaf7746cddcce7895a920e76f6da354" | \
  vercel env add SECRET_KEY production --scope $SCOPE --yes

# 添加 ALLOWED_ORIGINS
echo "https://user-experience-project-fxax.vercel.app" | \
  vercel env add ALLOWED_ORIGINS production --scope $SCOPE --yes

# 添加 ALGORITHM
echo "HS256" | \
  vercel env add ALGORITHM production --scope $SCOPE --yes

# 添加 ACCESS_TOKEN_EXPIRE_MINUTES
echo "30" | \
  vercel env add ACCESS_TOKEN_EXPIRE_MINUTES production --scope $SCOPE --yes

# 添加 ENVIRONMENT
echo "production" | \
  vercel env add ENVIRONMENT production --scope $SCOPE --yes

# 添加 DEBUG
echo "False" | \
  vercel env add DEBUG production --scope $SCOPE --yes

# 添加 APP_NAME
echo "用户体验拯救项目群管理系统" | \
  vercel env add APP_NAME production --scope $SCOPE --yes

# 添加 SUPABASE_URL
echo "https://djgmecfoecjkfqhieavg.supabase.co" | \
  vercel env add SUPABASE_URL production --scope $SCOPE --yes

# 添加 SUPABASE_ANON_KEY
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ21lY2ZvZWNqa2ZxaGllYXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTgyNDUsImV4cCI6MjA3Njg5NDI0NX0.m8bJgCTru7hep9Y_raoM7CFVii4vRdTn8g-Cb8Dxin0" | \
  vercel env add VITE_SUPABASE_ANON_KEY production --scope $SCOPE --yes

echo "环境变量添加完成！"

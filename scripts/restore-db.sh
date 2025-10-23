#!/bin/bash

#
# 数据库恢复脚本
# 用途：从备份文件恢复 PostgreSQL 数据库
#

set -e  # 遇到错误立即退出

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== 用户体验拯救数据库恢复脚本 ===${NC}"

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请提供备份文件路径${NC}"
    echo "用法: $0 <backup_file.sql.gz>"
    echo "示例: $0 ./backups/ux_rescue_20251023_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}错误: 备份文件不存在: $BACKUP_FILE${NC}"
    exit 1
fi

# 检查 DATABASE_URL 环境变量
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}错误: DATABASE_URL 环境变量未设置${NC}"
    echo "请设置 DATABASE_URL，例如:"
    echo "export DATABASE_URL=postgresql://user:password@host:5432/dbname"
    exit 1
fi

echo "备份文件: $BACKUP_FILE"
echo "文件大小: $(du -h "$BACKUP_FILE" | cut -f1)"
echo "恢复时间: $(date)"

# 警告确认
echo -e "${RED}警告: 此操作将覆盖当前数据库！${NC}"
read -p "确定要继续吗？(输入 YES 继续): " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo -e "${YELLOW}恢复已取消${NC}"
    exit 0
fi

# 从 DATABASE_URL 提取连接信息
DB_URL_CLEAN=$(echo "$DATABASE_URL" | sed 's/postgresql+asyncpg:/postgresql:/')

# 执行恢复
echo -e "${YELLOW}开始恢复数据库...${NC}"

if gunzip -c "$BACKUP_FILE" | psql "$DB_URL_CLEAN"; then
    echo -e "${GREEN}✓ 恢复成功！${NC}"
else
    echo -e "${RED}✗ 恢复失败！${NC}"
    exit 1
fi

echo -e "${GREEN}=== 恢复完成 ===${NC}"

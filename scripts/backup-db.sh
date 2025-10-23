#!/bin/bash

#
# 数据库备份脚本
# 用途：备份 PostgreSQL 数据库并压缩
#

set -e  # 遇到错误立即退出

# 配置
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/ux_rescue_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30  # 保留30天的备份

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== 用户体验拯救数据库备份脚本 ===${NC}"
echo "备份时间: $(date)"

# 检查 DATABASE_URL 环境变量
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}错误: DATABASE_URL 环境变量未设置${NC}"
    echo "请设置 DATABASE_URL，例如:"
    echo "export DATABASE_URL=postgresql://user:password@host:5432/dbname"
    exit 1
fi

# 创建备份目录
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}备份目录: $BACKUP_DIR${NC}"

# 执行备份
echo -e "${YELLOW}开始备份数据库...${NC}"

# 从 DATABASE_URL 提取连接信息（支持 postgresql:// 和 postgresql+asyncpg://）
DB_URL_CLEAN=$(echo "$DATABASE_URL" | sed 's/postgresql+asyncpg:/postgresql:/')

# 使用 pg_dump 备份并压缩
if pg_dump "$DB_URL_CLEAN" | gzip > "$BACKUP_FILE"; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ 备份成功！${NC}"
    echo -e "  文件: $BACKUP_FILE"
    echo -e "  大小: $BACKUP_SIZE"
else
    echo -e "${RED}✗ 备份失败！${NC}"
    exit 1
fi

# 清理旧备份
echo -e "${YELLOW}清理超过 ${RETENTION_DAYS} 天的旧备份...${NC}"
DELETED_COUNT=$(find "$BACKUP_DIR" -name "ux_rescue_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete -print | wc -l)
echo -e "${GREEN}已删除 $DELETED_COUNT 个旧备份文件${NC}"

# 列出现有备份
echo -e "${YELLOW}当前备份列表:${NC}"
ls -lh "$BACKUP_DIR"/ux_rescue_*.sql.gz 2>/dev/null || echo "  (无备份文件)"

echo -e "${GREEN}=== 备份完成 ===${NC}"

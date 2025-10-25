-- =====================================================
-- Supabase Auth 集成迁移
-- 将用户管理迁移到 Supabase Authentication
-- =====================================================

-- 1. 备份现有用户数据（如果有）
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;

-- 2. 删除 hashed_password 列（密码现在由 Supabase Auth 管理）
ALTER TABLE users DROP COLUMN IF EXISTS hashed_password;

-- 3. 修改 id 列，不再自动生成 UUID（将使用 auth.users 的 ID）
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;

-- 4. 添加注释说明
COMMENT ON TABLE users IS '用户信息表 - 与 auth.users 通过 id 关联';
COMMENT ON COLUMN users.id IS '用户ID - 必须与 auth.users.id 一致';

-- =====================================================
-- 迁移完成提示
-- =====================================================
-- 注意事项：
-- 1. 现有用户数据已备份到 users_backup 表
-- 2. users 表的 id 现在必须手动设置为 auth.users.id
-- 3. hashed_password 已移除，密码管理由 Supabase Auth 处理
-- 4. 新用户注册流程：
--    a. 先通过 Supabase Admin API 创建 auth.users 记录
--    b. 再在 public.users 中插入记录，使用相同的 ID
-- =====================================================

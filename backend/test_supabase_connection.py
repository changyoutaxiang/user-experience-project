"""
测试 Supabase 数据库连接
运行此脚本确保后端能正常连接到 Supabase
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from src.core.database import get_async_session_context


async def test_connection():
    """测试数据库连接"""
    print("🔍 开始测试 Supabase 数据库连接...")
    print("-" * 50)

    try:
        async with get_async_session_context() as session:
            # 测试 1: 基本连接
            print("✓ 步骤 1: 测试基本连接...")
            result = await session.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"  ✓ PostgreSQL 版本: {version[:50]}...")

            # 测试 2: 检查数据库名称
            print("\n✓ 步骤 2: 检查数据库...")
            result = await session.execute(text("SELECT current_database()"))
            db_name = result.scalar()
            print(f"  ✓ 当前数据库: {db_name}")

            # 测试 3: 列出所有表
            print("\n✓ 步骤 3: 检查数据表...")
            result = await session.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result.fetchall()]
            print(f"  ✓ 找到 {len(tables)} 个表:")
            for table in tables:
                print(f"    - {table}")

            # 测试 4: 检查用户表
            print("\n✓ 步骤 4: 检查用户表...")
            result = await session.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar()
            print(f"  ✓ 用户表中有 {user_count} 个用户")

            # 测试 5: 查询管理员用户
            print("\n✓ 步骤 5: 检查管理员账户...")
            result = await session.execute(text("""
                SELECT name, email, role
                FROM users
                WHERE role = 'admin'
                LIMIT 1
            """))
            admin = result.fetchone()
            if admin:
                print(f"  ✓ 管理员账户: {admin[0]} ({admin[1]})")
            else:
                print("  ⚠️  未找到管理员账户")

            print("\n" + "=" * 50)
            print("✅ 所有测试通过！数据库连接正常！")
            print("=" * 50)
            print("\n下一步:")
            print("1. 在本地启动后端: cd backend && uvicorn src.api.main:app --reload")
            print("2. 访问 API 文档: http://localhost:8000/docs")
            print("3. 使用管理员账户登录测试:")
            print("   邮箱: admin@example.com")
            print("   密码: admin123456")

    except Exception as e:
        print("\n" + "=" * 50)
        print("❌ 连接失败!")
        print("=" * 50)
        print(f"错误信息: {str(e)}")
        print("\n请检查:")
        print("1. backend/.env 文件中的 DATABASE_URL 是否正确")
        print("2. Supabase 数据库是否正常运行")
        print("3. 网络连接是否正常")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(test_connection())

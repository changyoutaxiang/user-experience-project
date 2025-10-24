"""测试数据库模块导入 - 逐步添加依赖"""
import os
from datetime import datetime

# 测试 1: 只导入这些看看是否会崩溃
print("Step 1: Basic imports OK")

try:
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
    from sqlalchemy import text
    print("Step 2: SQLAlchemy imports OK")
except Exception as e:
    print(f"Step 2 FAILED: {e}")

try:
    from passlib.context import CryptContext
    print("Step 3: Passlib import OK")
except Exception as e:
    print(f"Step 3 FAILED: {e}")

# 如果所有导入都成功，尝试创建密码上下文
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    print("Step 4: CryptContext creation OK")
except Exception as e:
    print(f"Step 4 FAILED: {e}")

print("All import tests completed")

"""数据库连接和用户操作 - Vercel serverless 版本"""
import os
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from sqlalchemy.pool import NullPool
from passlib.context import CryptContext
from supabase import create_client, Client

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 全局变量，延迟初始化
_engine = None
_session_factory = None
_supabase_client: Client = None

def get_supabase_client() -> Client:
    """获取或创建 Supabase 客户端"""
    global _supabase_client
    if _supabase_client is None:
        supabase_url = os.environ.get("SUPABASE_URL", "")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
        _supabase_client = create_client(supabase_url, supabase_key)
    return _supabase_client

async def reset_engine():
    """重置引擎和会话工厂 - 用于清理旧的事件循环"""
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _session_factory = None

def get_session_factory():
    """获取或创建会话工厂"""
    global _engine, _session_factory

    if _session_factory is None:
        # 数据库配置
        database_url = os.environ.get("DATABASE_URL", "")

        # 创建异步引擎
        # 使用 NullPool + statement_cache_size=0 解决 pgbouncer 问题
        _engine = create_async_engine(
            database_url,
            echo=False,
            poolclass=NullPool,
            connect_args={
                "statement_cache_size": 0  # 禁用asyncpg的prepared statement缓存
            }
        )

        # 创建会话工厂
        _session_factory = async_sessionmaker(
            _engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )

    return _session_factory

def hash_password(password: str) -> str:
    """加密密码"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

async def create_user(name: str, email: str, password: str) -> dict:
    """
    创建新用户 - 使用 Supabase Auth API

    Args:
        name: 用户姓名
        email: 用户邮箱
        password: 明文密码

    Returns:
        用户信息字典

    Raises:
        Exception: 如果邮箱已存在或数据库操作失败
    """
    try:
        # 使用 Supabase Admin API 创建认证用户
        supabase = get_supabase_client()

        auth_response = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,  # 自动确认邮箱，跳过验证流程
            "user_metadata": {
                "name": name
            }
        })

        if not auth_response or not auth_response.user:
            raise Exception("创建认证用户失败")

        auth_user = auth_response.user
        auth_user_id = auth_user.id

        # 在自定义 users 表中创建记录
        session_factory = get_session_factory()
        async with session_factory() as session:
            try:
                insert_query = text("""
                    INSERT INTO users (id, name, email, role, is_active, created_at, updated_at)
                    VALUES (:id, :name, :email, :role, :is_active, :created_at, :updated_at)
                    RETURNING id, name, email, role, is_active, created_at
                """)

                now = datetime.utcnow()

                result = await session.execute(
                    insert_query,
                    {
                        "id": auth_user_id,  # 使用 auth.users 的 ID
                        "name": name,
                        "email": email,
                        "role": "member",
                        "is_active": True,
                        "created_at": now,
                        "updated_at": now,
                    }
                )

                await session.commit()

                # 获取创建的用户信息
                user_row = result.fetchone()

                return {
                    "id": str(user_row[0]),
                    "name": user_row[1],
                    "email": user_row[2],
                    "role": user_row[3],
                    "is_active": user_row[4],
                    "created_at": user_row[5].isoformat() if user_row[5] else None,
                }

            except Exception as e:
                await session.rollback()
                # 如果数据库插入失败，尝试删除已创建的 auth 用户
                try:
                    supabase.auth.admin.delete_user(auth_user_id)
                except:
                    pass
                raise e

    except Exception as e:
        error_msg = str(e)
        # 处理 Supabase 特定错误
        if "already registered" in error_msg.lower() or "already exists" in error_msg.lower():
            raise Exception("邮箱已被注册")
        raise Exception(f"注册失败: {error_msg}")

async def authenticate_user(email: str, password: str) -> dict:
    """
    验证用户登录

    Args:
        email: 用户邮箱
        password: 明文密码

    Returns:
        用户信息字典

    Raises:
        Exception: 如果认证失败
    """
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            # 查询用户
            query = text("""
                SELECT id, name, email, hashed_password, role, is_active, created_at
                FROM users
                WHERE email = :email
            """)

            result = await session.execute(query, {"email": email})
            user_row = result.fetchone()

            if not user_row:
                raise Exception("邮箱或密码错误")

            # 验证密码
            if not verify_password(password, user_row[3]):
                raise Exception("邮箱或密码错误")

            # 检查用户是否激活
            if not user_row[5]:
                raise Exception("用户账户未激活")

            return {
                "id": str(user_row[0]),
                "name": user_row[1],
                "email": user_row[2],
                "role": user_row[4],
                "is_active": user_row[5],
                "created_at": user_row[6].isoformat() if user_row[6] else None,
            }

        except Exception as e:
            raise e

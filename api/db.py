"""数据库连接和用户操作 - Vercel serverless 版本"""
import os
import json
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from sqlalchemy.pool import NullPool
from passlib.context import CryptContext
import urllib.request
import urllib.error

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 全局变量，延迟初始化
_engine = None
_session_factory = None

def create_supabase_user(email: str, password: str, user_metadata: dict) -> dict:
    """使用 Supabase Admin API 创建用户"""
    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

    url = f"{supabase_url}/auth/v1/admin/users"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }

    data = {
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": user_metadata
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers=headers,
        method='POST'
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        raise Exception(f"Supabase API错误: {error_body}")

def supabase_sign_in(email: str, password: str) -> dict:
    """使用 Supabase Auth API 登录"""
    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_anon_key = os.environ.get("SUPABASE_ANON_KEY", "")

    url = f"{supabase_url}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": supabase_anon_key,
        "Content-Type": "application/json"
    }

    data = {
        "email": email,
        "password": password
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers=headers,
        method='POST'
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        error_data = json.loads(error_body) if error_body else {}
        error_msg = error_data.get('error_description', error_data.get('msg', '登录失败'))
        raise Exception(error_msg)

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
        auth_response = create_supabase_user(
            email=email,
            password=password,
            user_metadata={"name": name}
        )

        if not auth_response or "id" not in auth_response:
            raise Exception("创建认证用户失败")

        auth_user_id = auth_response["id"]

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
                raise e

    except Exception as e:
        error_msg = str(e)
        # 处理 Supabase 特定错误
        if "already registered" in error_msg.lower() or "already exists" in error_msg.lower() or "unique" in error_msg.lower():
            raise Exception("邮箱已被注册")
        raise Exception(f"注册失败: {error_msg}")

async def authenticate_user(email: str, password: str) -> dict:
    """
    验证用户登录 - 使用 Supabase Auth API

    Args:
        email: 用户邮箱
        password: 明文密码

    Returns:
        用户信息字典 + JWT access_token

    Raises:
        Exception: 如果认证失败
    """
    try:
        # 使用 Supabase Auth API 验证登录
        auth_result = supabase_sign_in(email, password)

        if not auth_result or "access_token" not in auth_result:
            raise Exception("邮箱或密码错误")

        user_id = auth_result.get("user", {}).get("id")
        if not user_id:
            raise Exception("认证失败")

        # 从数据库获取用户详细信息
        session_factory = get_session_factory()
        async with session_factory() as session:
            query = text("""
                SELECT id, name, email, role, is_active, created_at
                FROM users
                WHERE id = :user_id
            """)

            result = await session.execute(query, {"user_id": user_id})
            user_row = result.fetchone()

            if not user_row:
                raise Exception("用户信息不存在")

            # 检查用户是否激活
            if not user_row[4]:
                raise Exception("用户账户未激活")

            return {
                "id": str(user_row[0]),
                "name": user_row[1],
                "email": user_row[2],
                "role": user_row[3],
                "is_active": user_row[4],
                "created_at": user_row[5].isoformat() if user_row[5] else None,
                "access_token": auth_result["access_token"],
                "refresh_token": auth_result.get("refresh_token", ""),
                "expires_in": auth_result.get("expires_in", 3600)
            }

    except Exception as e:
        error_msg = str(e)
        if "invalid" in error_msg.lower() or "credentials" in error_msg.lower():
            raise Exception("邮箱或密码错误")
        raise e

"""
用户模型测试
"""
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import get_password_hash, verify_password
from src.models.user import User


class TestUserModel:
    """用户模型测试类"""

    @pytest.mark.asyncio
    async def test_password_hashing(self, async_session: AsyncSession):
        """测试密码加密"""
        plain_password = "mysecretpassword123"
        hashed_password = get_password_hash(plain_password)

        # 验证哈希值不等于原始密码
        assert hashed_password != plain_password

        # 验证哈希值长度合理（bcrypt 输出通常是 60 字符）
        assert len(hashed_password) > 50

        # 验证密码验证功能
        assert verify_password(plain_password, hashed_password) is True
        assert verify_password("wrongpassword", hashed_password) is False

    @pytest.mark.asyncio
    async def test_create_user_with_hashed_password(
        self, async_session: AsyncSession
    ):
        """测试创建带加密密码的用户"""
        plain_password = "userpassword123"
        hashed_password = get_password_hash(plain_password)

        user = User(
            email="hashtest@example.com",
            username="hashtest",
            full_name="Hash Test User",
            hashed_password=hashed_password,
            role="member",
        )

        async_session.add(user)
        await async_session.commit()
        await async_session.refresh(user)

        # 验证用户创建成功
        assert user.id is not None
        assert user.email == "hashtest@example.com"
        assert user.hashed_password == hashed_password

        # 验证密码不是明文
        assert user.hashed_password != plain_password

        # 验证可以使用原始密码验证
        assert verify_password(plain_password, user.hashed_password) is True

    @pytest.mark.asyncio
    async def test_user_roles(self, async_session: AsyncSession):
        """测试用户角色"""
        # 创建不同角色的用户
        admin_user = User(
            email="admin_role@example.com",
            username="admin_role",
            full_name="Admin Role User",
            hashed_password=get_password_hash("password"),
            role="admin",
        )

        member_user = User(
            email="member_role@example.com",
            username="member_role",
            full_name="Member Role User",
            hashed_password=get_password_hash("password"),
            role="member",
        )

        async_session.add_all([admin_user, member_user])
        await async_session.commit()

        # 验证角色设置
        assert admin_user.role == "admin"
        assert member_user.role == "member"

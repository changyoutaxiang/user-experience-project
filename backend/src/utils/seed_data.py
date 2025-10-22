"""
Data seeding script for creating initial database records.

Usage:
    python -m src.utils.seed_data
"""
import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import select

from src.core.database import async_session_maker
from src.core.security import get_password_hash
from src.models.expense import Expense
from src.models.project import Project, ProjectStatus
from src.models.project_member import ProjectMember
from src.models.task import Task, TaskPriority, TaskStatus
from src.models.user import User, UserRole


async def create_admin_user(db):
    """Create default admin user if it doesn't exist."""
    print("🔍 Checking for admin user...")

    # Check if admin exists
    result = await db.execute(select(User).where(User.email == "admin@example.com"))
    admin = result.scalar_one_or_none()

    if admin:
        print("✅ Admin user already exists")
        return admin

    # Create admin user
    admin = User(
        name="系统管理员",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123456"),
        role=UserRole.ADMIN,
        is_active=True,
    )

    db.add(admin)
    await db.commit()
    await db.refresh(admin)

    print("✅ Created admin user:")
    print(f"   Email: admin@example.com")
    print(f"   Password: admin123456")
    print(f"   Role: ADMIN")

    return admin


async def create_sample_users(db):
    """Create sample member users."""
    print("\n🔍 Checking for sample users...")

    sample_users = [
        {"name": "张三", "email": "zhangsan@example.com"},
        {"name": "李四", "email": "lisi@example.com"},
        {"name": "王五", "email": "wangwu@example.com"},
    ]

    created_users = []

    for user_data in sample_users:
        result = await db.execute(select(User).where(User.email == user_data["email"]))
        user = result.scalar_one_or_none()

        if user:
            print(f"   ⏭️  User {user_data['name']} already exists")
            created_users.append(user)
            continue

        user = User(
            name=user_data["name"],
            email=user_data["email"],
            hashed_password=get_password_hash("password123"),
            role=UserRole.MEMBER,
            is_active=True,
        )

        db.add(user)
        created_users.append(user)
        print(f"   ✅ Created user: {user_data['name']} ({user_data['email']})")

    await db.commit()

    for user in created_users:
        await db.refresh(user)

    return created_users


async def create_sample_projects(db, admin, members):
    """Create sample projects with tasks and expenses."""
    print("\n🔍 Checking for sample projects...")

    # Project 1: Website Redesign
    result = await db.execute(select(Project).where(Project.name == "官网改版项目"))
    project1 = result.scalar_one_or_none()

    if not project1:
        project1 = Project(
            name="官网改版项目",
            description="公司官网全面改版升级，提升用户体验",
            status=ProjectStatus.IN_PROGRESS,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 6, 30),
            budget=Decimal("500000.00"),
            spent=Decimal("125000.00"),
            owner_id=admin.id,
        )
        db.add(project1)
        await db.flush()
        print("   ✅ Created project: 官网改版项目")

        # Add members
        for member in members[:2]:
            pm = ProjectMember(
                project_id=project1.id,
                user_id=member.id,
                role="开发工程师",
            )
            db.add(pm)

        # Add tasks
        tasks1 = [
            Task(
                name="需求调研",
                description="收集用户反馈，分析竞品",
                status=TaskStatus.COMPLETED,
                priority=TaskPriority.HIGH,
                project_id=project1.id,
                assignee_id=members[0].id,
                created_by_id=admin.id,
                due_date=date(2024, 1, 31),
                completed_at=datetime(2024, 1, 28, 10, 30),
            ),
            Task(
                name="UI设计",
                description="设计新版官网页面原型",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.HIGH,
                project_id=project1.id,
                assignee_id=members[1].id,
                created_by_id=admin.id,
                due_date=date(2024, 3, 15),
            ),
            Task(
                name="前端开发",
                description="实现页面交互和动画效果",
                status=TaskStatus.TODO,
                priority=TaskPriority.MEDIUM,
                project_id=project1.id,
                assignee_id=members[0].id,
                created_by_id=admin.id,
                due_date=date(2024, 5, 1),
            ),
        ]

        for task in tasks1:
            db.add(task)

        # Add expenses
        expenses1 = [
            Expense(
                project_id=project1.id,
                amount=Decimal("80000.00"),
                description="设计师外包费用",
                category="人力成本",
                created_by_id=admin.id,
            ),
            Expense(
                project_id=project1.id,
                amount=Decimal("45000.00"),
                description="云服务器租用",
                category="基础设施",
                created_by_id=admin.id,
            ),
        ]

        for expense in expenses1:
            db.add(expense)

    else:
        print("   ⏭️  Project '官网改版项目' already exists")

    # Project 2: Mobile App
    result = await db.execute(select(Project).where(Project.name == "移动端APP开发"))
    project2 = result.scalar_one_or_none()

    if not project2:
        project2 = Project(
            name="移动端APP开发",
            description="开发iOS和Android双端移动应用",
            status=ProjectStatus.PLANNING,
            start_date=date(2024, 3, 1),
            end_date=date(2024, 12, 31),
            budget=Decimal("800000.00"),
            spent=Decimal("0.00"),
            owner_id=admin.id,
        )
        db.add(project2)
        await db.flush()
        print("   ✅ Created project: 移动端APP开发")

        # Add members
        pm2 = ProjectMember(
            project_id=project2.id,
            user_id=members[2].id,
            role="项目经理",
        )
        db.add(pm2)

        # Add tasks
        task2 = Task(
            name="技术选型",
            description="评估React Native vs Flutter",
            status=TaskStatus.TODO,
            priority=TaskPriority.HIGH,
            project_id=project2.id,
            assignee_id=members[2].id,
            created_by_id=admin.id,
            due_date=date(2024, 3, 31),
        )
        db.add(task2)

    else:
        print("   ⏭️  Project '移动端APP开发' already exists")

    await db.commit()


async def seed_database():
    """Main seeding function."""
    print("\n" + "=" * 60)
    print("🌱 Starting database seeding...")
    print("=" * 60)

    async with async_session_maker() as db:
        try:
            # Create admin user
            admin = await create_admin_user(db)

            # Create sample users
            members = await create_sample_users(db)

            # Create sample projects (optional - comment out for minimal seed)
            await create_sample_projects(db, admin, members)

            print("\n" + "=" * 60)
            print("✅ Database seeding completed successfully!")
            print("=" * 60)
            print("\n📝 Login credentials:")
            print("   Admin: admin@example.com / admin123456")
            print("   Members: password123 (for all sample users)")
            print()

        except Exception as e:
            print(f"\n❌ Error during seeding: {str(e)}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(seed_database())

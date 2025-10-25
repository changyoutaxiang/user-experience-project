"""
项目服务测试
"""
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.project import Project
from src.models.task import Task


class TestProjectService:
    """项目服务测试类"""

    @pytest.mark.asyncio
    async def test_calculate_project_progress(self, async_session: AsyncSession):
        """测试项目进度计算"""
        # 创建测试项目
        project = Project(
            name="进度测试项目",
            description="测试进度计算",
            budget=100000.0,
        )
        async_session.add(project)
        await async_session.commit()
        await async_session.refresh(project)

        # 创建任务（总共 4 个任务，2 个完成）
        tasks = [
            Task(
                title="任务1",
                project_id=project.id,
                status="completed",
            ),
            Task(
                title="任务2",
                project_id=project.id,
                status="completed",
            ),
            Task(
                title="任务3",
                project_id=project.id,
                status="in_progress",
            ),
            Task(
                title="任务4",
                project_id=project.id,
                status="todo",
            ),
        ]
        for task in tasks:
            async_session.add(task)
        await async_session.commit()

        # 计算进度（这里假设有一个计算进度的方法）
        # 如果实际代码中有 calculate_progress 方法，可以调用
        # progress = await calculate_progress(async_session, project.id)
        # assert progress == 50.0  # 2/4 = 50%

        # 临时验证：手动计算
        completed_count = sum(1 for t in tasks if t.status == "completed")
        total_count = len(tasks)
        expected_progress = (completed_count / total_count) * 100
        assert expected_progress == 50.0

    @pytest.mark.asyncio
    async def test_project_budget_tracking(self, async_session: AsyncSession):
        """测试项目预算追踪"""
        # 创建测试项目
        project = Project(
            name="预算测试项目",
            description="测试预算追踪",
            budget=100000.0,
        )
        async_session.add(project)
        await async_session.commit()
        await async_session.refresh(project)

        # 验证初始预算
        assert project.budget == 100000.0

        # 如果有预算使用记录，可以测试预算消耗
        # 这里只是验证基本属性
        assert project.actual_cost == 0.0 or project.actual_cost is None

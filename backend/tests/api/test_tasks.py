"""
任务 API 测试
"""
import pytest
from httpx import AsyncClient


class TestTasksAPI:
    """任务 API 测试类"""

    @pytest.fixture
    async def test_project(self, client: AsyncClient, admin_headers):
        """创建测试项目 fixture"""
        response = await client.post(
            "/api/projects/",
            headers=admin_headers,
            json={
                "name": "任务测试项目",
                "description": "用于任务测试",
                "budget": 50000.0,
            },
        )
        return response.json()

    @pytest.mark.asyncio
    async def test_create_task(
        self, client: AsyncClient, admin_headers, test_project
    ):
        """测试创建任务"""
        response = await client.post(
            "/api/tasks/",
            headers=admin_headers,
            json={
                "title": "测试任务",
                "description": "这是一个测试任务",
                "project_id": test_project["id"],
                "status": "todo",
                "priority": "medium",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "测试任务"
        assert data["project_id"] == test_project["id"]
        assert "id" in data

    @pytest.mark.asyncio
    async def test_list_tasks(self, client: AsyncClient, auth_headers):
        """测试获取任务列表"""
        response = await client.get(
            "/api/tasks/",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_assign_task(
        self, client: AsyncClient, admin_headers, test_project, test_user
    ):
        """测试分配任务"""
        # 创建任务
        create_response = await client.post(
            "/api/tasks/",
            headers=admin_headers,
            json={
                "title": "待分配任务",
                "description": "这个任务将被分配",
                "project_id": test_project["id"],
                "status": "todo",
            },
        )
        task_id = create_response.json()["id"]

        # 分配任务
        response = await client.post(
            f"/api/tasks/{task_id}/assign",
            headers=admin_headers,
            json={
                "assignee_id": str(test_user.id),
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["assignee_id"] == str(test_user.id)

    @pytest.mark.asyncio
    async def test_update_task_status(
        self, client: AsyncClient, admin_headers, test_project
    ):
        """测试更新任务状态"""
        # 创建任务
        create_response = await client.post(
            "/api/tasks/",
            headers=admin_headers,
            json={
                "title": "状态测试任务",
                "project_id": test_project["id"],
                "status": "todo",
            },
        )
        task_id = create_response.json()["id"]

        # 更新状态
        response = await client.patch(
            f"/api/tasks/{task_id}",
            headers=admin_headers,
            json={
                "status": "in_progress",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "in_progress"

    @pytest.mark.asyncio
    async def test_delete_task(
        self, client: AsyncClient, admin_headers, test_project
    ):
        """测试删除任务"""
        # 创建任务
        create_response = await client.post(
            "/api/tasks/",
            headers=admin_headers,
            json={
                "title": "待删除任务",
                "project_id": test_project["id"],
            },
        )
        task_id = create_response.json()["id"]

        # 删除
        response = await client.delete(
            f"/api/tasks/{task_id}",
            headers=admin_headers,
        )
        assert response.status_code == 204

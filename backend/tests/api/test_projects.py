"""
项目 API 测试
"""
import pytest
from httpx import AsyncClient


class TestProjectsAPI:
    """项目 API 测试类"""

    @pytest.mark.asyncio
    async def test_create_project(self, client: AsyncClient, admin_headers):
        """测试创建项目（需要管理员权限）"""
        response = await client.post(
            "/api/projects/",
            headers=admin_headers,
            json={
                "name": "测试项目",
                "description": "这是一个测试项目",
                "budget": 100000.0,
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "测试项目"
        assert data["budget"] == 100000.0
        assert "id" in data

    @pytest.mark.asyncio
    async def test_create_project_without_permission(
        self, client: AsyncClient, auth_headers
    ):
        """测试普通用户无法创建项目"""
        response = await client.post(
            "/api/projects/",
            headers=auth_headers,
            json={
                "name": "测试项目",
                "description": "这是一个测试项目",
                "budget": 100000.0,
            },
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_list_projects(self, client: AsyncClient, auth_headers):
        """测试获取项目列表"""
        response = await client.get(
            "/api/projects/",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_project_detail(self, client: AsyncClient, admin_headers):
        """测试获取项目详情"""
        # 先创建一个项目
        create_response = await client.post(
            "/api/projects/",
            headers=admin_headers,
            json={
                "name": "详情测试项目",
                "description": "测试获取详情",
                "budget": 50000.0,
            },
        )
        project_id = create_response.json()["id"]

        # 获取详情
        response = await client.get(
            f"/api/projects/{project_id}",
            headers=admin_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == project_id
        assert data["name"] == "详情测试项目"

    @pytest.mark.asyncio
    async def test_update_project(self, client: AsyncClient, admin_headers):
        """测试更新项目"""
        # 先创建
        create_response = await client.post(
            "/api/projects/",
            headers=admin_headers,
            json={
                "name": "原始项目名",
                "description": "原始描述",
                "budget": 30000.0,
            },
        )
        project_id = create_response.json()["id"]

        # 更新
        response = await client.put(
            f"/api/projects/{project_id}",
            headers=admin_headers,
            json={
                "name": "更新后的项目名",
                "description": "更新后的描述",
                "budget": 40000.0,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "更新后的项目名"
        assert data["budget"] == 40000.0

    @pytest.mark.asyncio
    async def test_delete_project(self, client: AsyncClient, admin_headers):
        """测试删除项目"""
        # 先创建
        create_response = await client.post(
            "/api/projects/",
            headers=admin_headers,
            json={
                "name": "待删除项目",
                "description": "这个项目将被删除",
                "budget": 10000.0,
            },
        )
        project_id = create_response.json()["id"]

        # 删除
        response = await client.delete(
            f"/api/projects/{project_id}",
            headers=admin_headers,
        )
        assert response.status_code == 204

        # 验证已删除
        get_response = await client.get(
            f"/api/projects/{project_id}",
            headers=admin_headers,
        )
        assert get_response.status_code == 404

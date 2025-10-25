"""Vercel serverless entry point - 测试数据库模块导入"""
from http.server import BaseHTTPRequestHandler
import json
import sys
import traceback

# 添加当前目录到 Python 路径
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# 尝试导入数据库模块并捕获错误
db_import_error = None
create_user = None
authenticate_user = None
reset_engine = None

try:
    import db
    create_user = db.create_user
    authenticate_user = db.authenticate_user
    reset_engine = db.reset_engine
    db_imported = True
except Exception as e:
    db_imported = False
    db_import_error = {
        "error": str(e),
        "type": type(e).__name__,
        "traceback": traceback.format_exc()
    }

class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        """处理 GET 请求"""
        path = self.path.replace('/api', '', 1) if self.path.startswith('/api') else self.path

        # Dashboard 数据接口
        if path == '/v1/dashboard':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            # 返回初始化的空数据结构
            dashboard_data = {
                "total_projects": 0,
                "overdue_projects": 0,
                "overdue_tasks": 0,
                "my_pending_tasks": 0,
                "total_tasks": 0,
                "total_budget": 0,
                "total_spent": 0,
                "budget_usage_rate": 0,
                "projects_by_status": {
                    "planning": 0,
                    "in_progress": 0,
                    "completed": 0,
                    "archived": 0
                }
            }

            self.wfile.write(json.dumps(dashboard_data, ensure_ascii=False).encode('utf-8'))
            return

        # 项目列表接口
        if path == '/v1/projects' or path.startswith('/v1/projects?'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            # 返回空项目列表
            projects = []

            self.wfile.write(json.dumps(projects, ensure_ascii=False).encode('utf-8'))
            return

        # 健康检查接口
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        response = {
            "status": "healthy",
            "message": "API with database module test",
            "path": self.path,
            "db_module_imported": db_imported,
            "db_import_error": db_import_error,
            "python_version": sys.version,
            "available_functions": {
                "create_user": create_user is not None,
                "authenticate_user": authenticate_user is not None
            }
        }

        self.wfile.write(json.dumps(response, indent=2).encode())
        return

    def do_POST(self):
        """处理 POST 请求"""
        import asyncio

        # 解析请求路径
        path = self.path.replace('/api', '', 1) if self.path.startswith('/api') else self.path

        # 读取请求体
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Invalid JSON"
            }).encode())
            return

        # 处理注册请求
        if path == '/v1/auth/register':
            # 检查数据库模块是否可用
            if not db_imported:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Database module not available",
                    "details": db_import_error
                }).encode())
                return

            # 验证输入
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')

            if not name or not email or not password:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "姓名、邮箱和密码都是必填项"
                }).encode())
                return

            if len(password) < 8:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "密码长度至少为8个字符"
                }).encode())
                return

            # 创建新事件循环并重置引擎
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                # 重置数据库引擎以避免事件循环冲突
                if reset_engine:
                    loop.run_until_complete(reset_engine())

                user = loop.run_until_complete(create_user(name, email, password))
                loop.close()

                self.send_response(201)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "message": "用户注册成功",
                    "user": user
                }, ensure_ascii=False).encode('utf-8'))
                return
            except Exception as e:
                loop.close()
                error_msg = str(e)

                # 处理特定的数据库错误
                if 'duplicate key' in error_msg.lower() or 'unique constraint' in error_msg.lower():
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "error": "该邮箱已被注册"
                    }).encode())
                    return

                # 其他错误
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "注册失败",
                    "details": error_msg,
                    "traceback": traceback.format_exc()
                }).encode())
                return

        # 处理登录请求
        if path == '/v1/auth/login':
            # 检查数据库模块是否可用
            if not db_imported:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Database module not available",
                    "details": db_import_error
                }).encode())
                return

            # 验证输入
            email = data.get('email', '').strip()
            password = data.get('password', '')

            if not email or not password:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "邮箱和密码都是必填项"
                }, ensure_ascii=False).encode('utf-8'))
                return

            # 创建新事件循环并重置引擎
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                # 重置数据库引擎以避免事件循环冲突
                if reset_engine:
                    loop.run_until_complete(reset_engine())

                result = loop.run_until_complete(authenticate_user(email, password))
                loop.close()

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "access_token": result["access_token"],
                    "refresh_token": result.get("refresh_token", ""),
                    "expires_in": result.get("expires_in", 3600),
                    "user": {
                        "id": result["id"],
                        "name": result["name"],
                        "email": result["email"],
                        "role": result["role"],
                        "is_active": result["is_active"]
                    }
                }, ensure_ascii=False).encode('utf-8'))
                return
            except Exception as e:
                loop.close()
                error_msg = str(e)

                # 处理认证错误
                if '邮箱或密码错误' in error_msg or '未激活' in error_msg:
                    self.send_response(401)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "error": error_msg
                    }, ensure_ascii=False).encode('utf-8'))
                    return

                # 其他错误
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "登录失败",
                    "details": error_msg,
                    "traceback": traceback.format_exc()
                }, ensure_ascii=False).encode('utf-8'))
                return

        # 未知路径
        self.send_response(404)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            "error": "Not found",
            "path": path
        }).encode())
        return

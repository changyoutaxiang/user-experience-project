"""Vercel serverless entry point - 完整数据库支持版本"""
from http.server import BaseHTTPRequestHandler
import json
import asyncio
from db import create_user, authenticate_user

class handler(BaseHTTPRequestHandler):

    def _send_cors_headers(self):
        """发送 CORS 头"""
        self.send_header('Access-Control-Allow-Origin', 'https://user-experience-project-fxax.vercel.app')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Credentials', 'true')

    def do_OPTIONS(self):
        """处理 CORS 预检请求"""
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()
        return

    def do_GET(self):
        """处理 GET 请求"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self._send_cors_headers()
        self.end_headers()

        if self.path == '/health' or self.path == '/':
            response = {"status": "healthy", "message": "Backend with database support"}
        else:
            response = {"error": "Not found"}

        self.wfile.write(json.dumps(response).encode())
        return

    def do_POST(self):
        """处理 POST 请求"""
        # 读取请求体
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        try:
            data = json.loads(body) if body else {}
        except:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
            return

        # 处理注册请求
        if self.path == '/api/v1/auth/register':
            try:
                # 验证必需字段
                if not data.get('name') or not data.get('email') or not data.get('password'):
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self._send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"detail": "姓名、邮箱和密码都是必需的"}).encode())
                    return

                # 验证密码长度
                if len(data.get('password', '')) < 8:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self._send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"detail": "密码长度至少为 8 个字符"}).encode())
                    return

                # 创建用户（使用异步函数）
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                user = loop.run_until_complete(
                    create_user(
                        name=data['name'],
                        email=data['email'],
                        password=data['password']
                    )
                )
                loop.close()

                # 返回成功响应
                self.send_response(201)
                self.send_header('Content-type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(user).encode())

            except Exception as e:
                error_message = str(e)
                status_code = 400 if "已被注册" in error_message else 500

                self.send_response(status_code)
                self.send_header('Content-type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"detail": error_message}).encode())

        # 处理登录请求（暂时不实现，返回 501）
        elif self.path == '/api/v1/auth/login':
            self.send_response(501)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"detail": "登录功能即将推出"}).encode())

        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

        return

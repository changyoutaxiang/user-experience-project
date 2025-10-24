"""Vercel serverless entry point - 手动处理 HTTP 请求"""
from http.server import BaseHTTPRequestHandler
import json
import urllib.parse

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
            response = {"status": "healthy", "message": "Backend is running"}
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
            data = {}

        # 处理注册请求
        if self.path == '/api/v1/auth/register':
            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()

            response = {
                "id": "temp-user-id",
                "name": data.get("name", ""),
                "email": data.get("email", ""),
                "role": "member",
                "is_active": True,
                "created_at": "2025-10-24T00:00:00Z"
            }

            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()

            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

        return

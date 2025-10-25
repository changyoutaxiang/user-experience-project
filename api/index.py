"""Vercel serverless entry point - 简化测试版本"""
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        """处理 GET 请求"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        path = self.path.replace('/api', '', 1) if self.path.startswith('/api') else self.path

        response = {
            "status": "healthy",
            "message": "API is working!",
            "path": self.path,
            "normalized_path": path
        }

        self.wfile.write(json.dumps(response).encode())
        return

    def do_POST(self):
        """处理 POST 请求"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        try:
            data = json.loads(body) if body else {}
        except:
            data = {}

        response = {
            "message": "POST received",
            "data": data
        }

        self.wfile.write(json.dumps(response).encode())
        return

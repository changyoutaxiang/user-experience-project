"""Vercel serverless entry point - 测试数据库模块导入"""
from http.server import BaseHTTPRequestHandler
import json
import sys
import traceback

# 尝试导入数据库模块并捕获错误
db_import_error = None
create_user = None
authenticate_user = None

try:
    from db import create_user, authenticate_user
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
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        path = self.path.replace('/api', '', 1) if self.path.startswith('/api') else self.path

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

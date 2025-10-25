"""Vercel serverless entry point - 测试版本"""
from http.server import BaseHTTPRequestHandler
import json
import sys
from io import StringIO

# 测试数据库相关导入
import_test_output = []

# 测试 1: 基本导入
try:
    import os
    from datetime import datetime
    import_test_output.append("Step 1: Basic imports OK")
except Exception as e:
    import_test_output.append(f"Step 1 FAILED: {e}")

# 测试 2: SQLAlchemy 导入
try:
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
    from sqlalchemy import text
    import_test_output.append("Step 2: SQLAlchemy imports OK")
except Exception as e:
    import_test_output.append(f"Step 2 FAILED: {e}")

# 测试 3: Passlib 导入
try:
    from passlib.context import CryptContext
    import_test_output.append("Step 3: Passlib import OK")
except Exception as e:
    import_test_output.append(f"Step 3 FAILED: {e}")

# 测试 4: 创建 CryptContext
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    import_test_output.append("Step 4: CryptContext creation OK")
except Exception as e:
    import_test_output.append(f"Step 4 FAILED: {e}")

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
            response = {
                "status": "healthy",
                "message": "Testing DB imports",
                "import_test": import_test_output
            }
        else:
            response = {"error": "Not found"}

        self.wfile.write(json.dumps(response).encode())
        return

    def do_POST(self):
        """处理 POST 请求"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self._send_cors_headers()
        self.end_headers()

        response = {"message": "POST endpoint test - no DB"}
        self.wfile.write(json.dumps(response).encode())
        return

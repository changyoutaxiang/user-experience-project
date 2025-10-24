"""Vercel serverless entry point - 测试版本"""
from http.server import BaseHTTPRequestHandler
import json
import sys
from io import StringIO

# 捕获导入测试的输出
import_test_output = []

try:
    # 捕获 print 输出
    old_stdout = sys.stdout
    sys.stdout = StringIO()

    import db_test

    # 获取输出
    output = sys.stdout.getvalue()
    sys.stdout = old_stdout
    import_test_output = output.split('\n')
except Exception as e:
    sys.stdout = old_stdout
    import_test_output = [f"Import test failed: {str(e)}"]

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

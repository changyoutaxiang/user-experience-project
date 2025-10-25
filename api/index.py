"""
Vercel Serverless Function - FastAPI Application Entry Point

将完整的 FastAPI 后端应用部署到 Vercel Serverless Functions。
使用 Mangum ASGI 适配器将 FastAPI 转换为 Vercel 兼容的处理器。
"""
import sys
import os

# 添加项目根目录和 backend 目录到 Python 路径
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_dir = os.path.join(project_root, "backend")

if project_root not in sys.path:
    sys.path.insert(0, project_root)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# 导入 FastAPI 应用
try:
    from backend.src.api.main import app
    from mangum import Mangum

    # 创建 Vercel 兼容的 handler
    handler = Mangum(app, lifespan="off")

except ImportError as e:
    # 如果导入失败，创建一个简单的错误处理器
    from http.server import BaseHTTPRequestHandler
    import json
    import traceback

    class handler(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            error_info = {
                "error": "Failed to import FastAPI application",
                "details": str(e),
                "traceback": traceback.format_exc(),
                "sys_path": sys.path,
                "current_dir": current_dir,
                "project_root": project_root,
                "backend_dir": backend_dir
            }

            self.wfile.write(json.dumps(error_info, indent=2).encode())

        def do_POST(self):
            self.do_GET()

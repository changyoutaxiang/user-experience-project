"""最简单的 Vercel 测试端点"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Test App")

# 添加 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Simple test endpoint works!"}

@app.get("/health")
async def health():
    return {"status": "healthy", "message": "Simple app is running"}

# Vercel 需要导出 app
handler = app

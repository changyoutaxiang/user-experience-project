"""最小化 FastAPI 应用 - 仅包含注册功能"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 创建 FastAPI 应用
app = FastAPI(title="用户体验拯救 API")

# 配置 CORS
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "https://user-experience-project-fxax.vercel.app")
origins = [origin.strip() for origin in ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "API is running", "version": "minimal"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/v1/auth/register")
async def register(user_data: dict):
    """简化版注册端点 - 暂时只返回成功"""
    return {
        "id": "temp-id",
        "name": user_data.get("name"),
        "email": user_data.get("email"),
        "role": "member",
        "is_active": True,
        "created_at": "2025-10-24T00:00:00"
    }

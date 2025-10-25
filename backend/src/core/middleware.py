"""
安全中间件配置
"""
from typing import Callable
from fastapi import Request, Response
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.base import BaseHTTPMiddleware


# 速率限制器
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],  # 默认限制
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """添加安全响应头中间件"""

    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)

        # 安全头部
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        # 如果是生产环境，添加 HSTS
        # if settings.ENVIRONMENT == "production":
        #     response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


def rate_limit_error_handler(request: Request, exc: RateLimitExceeded):
    """速率限制错误处理"""
    return Response(
        content="Rate limit exceeded. Please try again later.",
        status_code=429,
        headers={"Retry-After": str(exc.detail)},
    )

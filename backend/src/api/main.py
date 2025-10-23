"""FastAPI main application entry point."""
import logging
import time

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from slowapi.errors import RateLimitExceeded

from src.api.routes import audit_logs, auth, dashboard, expenses, projects, tasks, users
from src.core.config import settings
from src.core.middleware import (
    limiter,
    rate_limit_error_handler,
    SecurityHeadersMiddleware,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="""
    ## 用户体验拯救项目群管理系统 API

    一个现代化的全栈项目管理系统，提供完整的 RESTful API。

    ### 主要功能
    - 🔐 用户认证和授权（JWT）
    - 📊 项目和任务管理
    - 💰 项目支出追踪
    - 📎 飞书文档集成
    - 🔍 完整的审计日志

    ### 认证
    大多数 API 端点需要 JWT 认证。获取 token：
    1. 使用 `/api/v1/auth/login` 登录
    2. 在请求头中添加: `Authorization: Bearer <token>`

    ### 速率限制
    - 默认限制: 100 次/分钟
    - 登录接口: 5 次/分钟
    """,
    version="0.1.0",
    contact={
        "name": "UX Rescue Team",
        "url": "https://github.com/changyoutaxiang/user-experience-project",
    },
    license_info={
        "name": "MIT",
    },
)

# Configure rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_error_handler)

# Add GZip compression middleware (responses > 1KB)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],  # 明确指定允许的方法
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests and their processing time."""
    start_time = time.time()

    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")

    try:
        response = await call_next(request)

        # Calculate processing time
        process_time = time.time() - start_time

        # Log response
        logger.info(
            f"Response: {request.method} {request.url.path} "
            f"- Status: {response.status_code} - Time: {process_time:.3f}s"
        )

        # Add processing time header
        response.headers["X-Process-Time"] = str(process_time)

        return response
    except Exception as e:
        # Log exception
        process_time = time.time() - start_time
        logger.error(
            f"Error: {request.method} {request.url.path} "
            f"- Exception: {str(e)} - Time: {process_time:.3f}s"
        )
        raise


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed error messages."""
    errors = []
    for error in exc.errors():
        error_detail = {
            "loc": error["loc"],
            "msg": error["msg"],
            "type": error["type"],
        }
        errors.append(error_detail)

    logger.warning(f"Validation error on {request.url.path}: {errors}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "请求参数验证失败",
            "errors": errors,
        },
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors."""
    logger.error(f"Database error on {request.url.path}: {str(exc)}")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "数据库操作失败，请稍后重试",
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all uncaught exceptions."""
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "服务器内部错误，请联系管理员",
        },
    )


# Health check endpoints
@app.get("/health", tags=["Health"])
async def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "app": settings.APP_NAME}


@app.get("/health/detailed", tags=["Health"])
async def detailed_health_check():
    """Detailed health check with database connectivity."""
    from datetime import datetime
    from src.core.database import get_db

    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "checks": {}
    }

    # Database check
    try:
        db = get_db()
        async for session in db:
            await session.execute("SELECT 1")
            health_status["checks"]["database"] = "healthy"
            break
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = f"unhealthy: {str(e)}"

    return health_status


# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(expenses.router, prefix="/api/v1", tags=["Expenses"])
app.include_router(audit_logs.router, prefix="/api/v1/audit-logs", tags=["Audit Logs"])


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "health": "/health",
    }

"""Vercel serverless entry point."""
import os
import sys
from pathlib import Path

# Add project root to Python path
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

# Set default environment for serverless
os.environ.setdefault("ENVIRONMENT", "production")

# Import and configure the FastAPI app
try:
    from src.api.main import app

    # Vercel requires the app to be named 'app' or 'handler'
    # Export both for compatibility
    handler = app

except Exception as e:
    # Create a minimal error-reporting app if main app fails
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI()

    @app.get("/")
    @app.get("/health")
    async def error():
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "message": "Failed to initialize main app"}
        )

    handler = app

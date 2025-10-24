"""Vercel serverless entry point."""
from src.api.main import app

# Export the FastAPI app for Vercel
__all__ = ["app"]

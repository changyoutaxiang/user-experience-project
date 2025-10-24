"""Vercel serverless entry point with FastAPI."""
import sys
from pathlib import Path

# Add project root to Python path
root = Path(__file__).parent.parent
sys.path.insert(0, str(root))

# Import FastAPI app
from src.api.main import app

# Vercel serverless handler
from mangum import Mangum

handler = Mangum(app, lifespan="off")

"""Vercel serverless entry point."""
import sys
from pathlib import Path

# Add project root to Python path
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

# Now import the FastAPI app
from src.api.main import app

# Export for Vercel
__all__ = ["app"]

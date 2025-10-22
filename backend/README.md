# 用户体验拯救 - Backend API

FastAPI-based backend service for the UX Rescue Project Management System.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)

## Overview

This is the backend API service for the UX Rescue Project Management System, providing RESTful APIs for project management, task tracking, expense management, user authentication, and audit logging.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control (ADMIN/MEMBER)
- **Project Management**: Create, update, and manage projects with status tracking and budget management
- **Task Management**: Comprehensive task tracking with priorities, assignments, and status workflows
- **Expense Tracking**: Record and manage project expenses with categorization
- **Document Management**: Link Feishu documents to projects
- **Audit Logging**: Comprehensive audit trail for all system operations
- **Dashboard Analytics**: Real-time statistics and insights
- **Request Logging**: Performance monitoring with request/response timing
- **Error Handling**: Comprehensive exception handling with localized error messages

## Tech Stack

- **Framework**: FastAPI 0.110.0
- **Database**: PostgreSQL 15 with SQLAlchemy 2.0 (async)
- **Authentication**: JWT tokens with python-jose
- **Password Hashing**: bcrypt via passlib
- **Migrations**: Alembic 1.13.1
- **Validation**: Pydantic 2.6
- **ASGI Server**: Uvicorn with auto-reload
- **Testing**: pytest with pytest-asyncio
- **Code Quality**: black, isort, flake8, mypy

## Prerequisites

- Python 3.11 or higher
- PostgreSQL 15 or higher
- pip or uv package manager

## Installation

### Option 1: Local Setup

1. **Create and activate virtual environment**:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

### Option 2: Docker Setup

Use the Docker Compose setup from the project root (recommended):
```bash
cd ..  # Go to project root
docker-compose up -d postgres backend
```

## Configuration

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ux_rescue_pm

# Security
SECRET_KEY=your-secret-key-change-in-production-use-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Application
APP_NAME=用户体验拯救项目管理系统
DEBUG=True
```

**Important Security Notes**:
- Change `SECRET_KEY` in production to a strong random string (use `openssl rand -hex 32`)
- Set `DEBUG=False` in production
- Configure `ALLOWED_ORIGINS` to match your frontend domain(s)

## Database Setup

### 1. Create Database

If using local PostgreSQL:
```bash
psql -U postgres
CREATE DATABASE ux_rescue_pm;
\q
```

### 2. Run Migrations

```bash
# Initialize Alembic (already done)
# alembic init alembic

# Create initial migration (already created)
# alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### 3. Seed Initial Data

Load sample data including admin user and demo projects:

```bash
python -m src.utils.seed_data
```

This creates:
- **Admin user**: admin@example.com / admin123456
- **Sample users**: 3 members with password123
- **Sample projects**: 2 projects with tasks, expenses, and team members

## Running the Application

### Development Mode (with auto-reload)

```bash
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

### Production Mode

```bash
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

### Interactive Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
  - Test endpoints directly in the browser
  - View request/response schemas
  - Authorize with JWT token

- **ReDoc**: http://localhost:8000/redoc
  - Alternative documentation view
  - Better for reading and reference

### API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login (returns JWT token)
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user profile

#### Dashboard
- `GET /api/v1/dashboard/statistics` - Get dashboard statistics

#### Projects
- `GET /api/v1/projects` - List all projects (with filters)
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/{project_id}` - Get project details
- `PUT /api/v1/projects/{project_id}` - Update project
- `DELETE /api/v1/projects/{project_id}` - Delete project
- `POST /api/v1/projects/{project_id}/members` - Add project member
- `DELETE /api/v1/projects/{project_id}/members/{member_id}` - Remove member
- `POST /api/v1/projects/{project_id}/documents` - Add document link
- `DELETE /api/v1/projects/{project_id}/documents/{document_id}` - Delete document

#### Tasks
- `GET /api/v1/tasks` - List tasks (with filters)
- `POST /api/v1/tasks` - Create new task
- `GET /api/v1/tasks/{task_id}` - Get task details
- `PUT /api/v1/tasks/{task_id}` - Update task
- `DELETE /api/v1/tasks/{task_id}` - Delete task
- `GET /api/v1/tasks/my-tasks` - Get tasks assigned to current user

#### Expenses
- `GET /api/v1/projects/{project_id}/expenses` - List project expenses
- `POST /api/v1/projects/{project_id}/expenses` - Create expense
- `PUT /api/v1/expenses/{expense_id}` - Update expense
- `DELETE /api/v1/expenses/{expense_id}` - Delete expense

#### Users (Admin only)
- `GET /api/v1/users` - List all users
- `POST /api/v1/users` - Create new user
- `GET /api/v1/users/{user_id}` - Get user details
- `PUT /api/v1/users/{user_id}` - Update user
- `DELETE /api/v1/users/{user_id}` - Deactivate user
- `PUT /api/v1/users/{user_id}/role` - Update user role

#### Audit Logs (Admin only)
- `GET /api/v1/audit-logs` - List audit logs (with filters)
- `GET /api/v1/audit-logs/{log_id}` - Get audit log details

## Testing

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

### Test Coverage

View coverage report:
```bash
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

## Project Structure

```
backend/
├── alembic/                    # Database migrations
│   ├── versions/              # Migration files
│   └── env.py                 # Alembic environment
├── src/
│   ├── api/                   # API layer
│   │   ├── main.py           # FastAPI app instance
│   │   ├── dependencies.py   # Dependency injection
│   │   └── routes/           # API route handlers
│   │       ├── auth.py       # Authentication endpoints
│   │       ├── dashboard.py  # Dashboard endpoints
│   │       ├── projects.py   # Project management
│   │       ├── tasks.py      # Task management
│   │       ├── expenses.py   # Expense tracking
│   │       ├── users.py      # User management
│   │       └── audit_logs.py # Audit log viewing
│   ├── core/                  # Core functionality
│   │   ├── config.py         # Application configuration
│   │   ├── database.py       # Database connection
│   │   └── security.py       # Authentication & hashing
│   ├── models/                # SQLAlchemy models
│   │   ├── user.py           # User model
│   │   ├── project.py        # Project model
│   │   ├── task.py           # Task model
│   │   ├── expense.py        # Expense model
│   │   ├── project_member.py # Project membership
│   │   ├── document_link.py  # Document links
│   │   └── audit_log.py      # Audit logging
│   ├── schemas/               # Pydantic schemas
│   │   ├── user.py           # User DTOs
│   │   ├── project.py        # Project DTOs
│   │   ├── task.py           # Task DTOs
│   │   └── ...
│   ├── services/              # Business logic layer
│   │   ├── auth_service.py   # Authentication logic
│   │   ├── project_service.py # Project operations
│   │   ├── task_service.py   # Task operations
│   │   ├── expense_service.py # Expense operations
│   │   ├── user_service.py   # User management
│   │   ├── audit_service.py  # Audit logging
│   │   └── dashboard_service.py # Statistics
│   └── utils/                 # Utilities
│       └── seed_data.py      # Database seeding
├── tests/                     # Test suite
├── alembic.ini               # Alembic configuration
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## Development

### Code Style

The project uses the following tools for code quality:

```bash
# Format code with black
black src tests

# Sort imports with isort
isort src tests

# Lint with flake8
flake8 src tests

# Type checking with mypy
mypy src
```

### Creating a New Migration

After modifying models:

```bash
# Generate migration
alembic revision --autogenerate -m "Description of changes"

# Review the generated migration in alembic/versions/

# Apply migration
alembic upgrade head
```

### Adding a New Endpoint

1. Create schema in `src/schemas/`
2. Add service method in `src/services/`
3. Create route handler in `src/api/routes/`
4. Include router in `src/api/main.py`
5. Write tests in `tests/`

## Deployment

### Environment Variables

Set the following environment variables in production:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database
SECRET_KEY=<your-production-secret-key>
ALLOWED_ORIGINS=https://your-frontend-domain.com
DEBUG=False
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Railway Deployment

See [railway.toml](railway.toml) for Railway deployment configuration.

Quick deploy:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Deploy
railway up
```

### Docker Deployment

```bash
# Build image
docker build -t ux-rescue-backend -f ../docker/backend.Dockerfile .

# Run container
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql+asyncpg://... \
  -e SECRET_KEY=your-secret-key \
  ux-rescue-backend
```

### Health Checks

The application provides a health check endpoint:
```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "app": "用户体验拯救项目管理系统"
}
```

## Monitoring

### Request Logging

All requests are logged with timing information:
```
2024-01-15 10:30:45 - src.api.main - INFO - Request: GET /api/v1/projects
2024-01-15 10:30:45 - src.api.main - INFO - Response: GET /api/v1/projects - Status: 200 - Time: 0.045s
```

### Performance Monitoring

Each response includes an `X-Process-Time` header showing request processing time in seconds.

### Error Logging

Errors are logged with full stack traces:
```
2024-01-15 10:35:12 - src.api.main - ERROR - Unhandled exception on /api/v1/projects: ...
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check database exists
psql -U postgres -l | grep ux_rescue_pm

# Test connection with DATABASE_URL
psql postgresql://postgres:postgres@localhost:5432/ux_rescue_pm
```

### Migration Issues

```bash
# Check current migration version
alembic current

# View migration history
alembic history

# Downgrade one version
alembic downgrade -1

# Upgrade to latest
alembic upgrade head
```

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

## Contributing

1. Follow the code style guidelines
2. Write tests for new features
3. Update documentation
4. Run linters and tests before committing

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.

---

**Last Updated**: 2024-01-15

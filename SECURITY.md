# Security Guidelines

This document outlines the security measures implemented in the UX Rescue Project Management System and best practices for secure deployment.

## Table of Contents

- [Authentication & Authorization](#authentication--authorization)
- [Password Security](#password-security)
- [JWT Token Management](#jwt-token-management)
- [CORS Configuration](#cors-configuration)
- [Database Security](#database-security)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)
- [Security Checklist](#security-checklist)

## Authentication & Authorization

### Role-Based Access Control (RBAC)

The system implements two user roles:

- **ADMIN**: Full system access including user management and audit logs
- **MEMBER**: Limited access to assigned projects and tasks

**Implementation**:
- Role checks in API dependencies ([backend/src/api/dependencies.py](backend/src/api/dependencies.py))
- Protected routes require valid JWT token
- Admin-only routes verified via `get_admin_user` dependency

### Session Management

- JWT tokens expire after 30 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- No automatic token refresh (stateless authentication)
- Users must re-authenticate after token expiration
- Tokens stored in frontend localStorage

## Password Security

### Password Requirements

**Minimum requirements** (enforced in frontend):
- Length: 8 characters minimum
- Must contain at least one letter (a-z, A-Z)
- Must contain at least one number (0-9)

**Hashing**:
- Algorithm: bcrypt (via passlib)
- Work factor: Default bcrypt settings (12 rounds)
- No password storage in plaintext
- Passwords validated via [frontend/src/utils/validators.ts](frontend/src/utils/validators.ts)

**Best Practices**:
- Encourage users to use password managers
- Consider implementing password strength meter
- Enforce password rotation policy if needed

## JWT Token Management

### Token Configuration

```python
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

### Token Structure

```json
{
  "sub": "user_email@example.com",
  "exp": 1234567890
}
```

### Security Considerations

1. **Secret Key**:
   - Must be a cryptographically secure random string
   - Minimum 32 characters recommended
   - Generate using: `openssl rand -hex 32`
   - **NEVER commit SECRET_KEY to version control**

2. **Token Expiration**:
   - Set to 30 minutes (industry standard for web apps)
   - Balance between security and user convenience
   - Consider longer expiration for mobile apps

3. **Token Storage**:
   - Frontend stores tokens in localStorage
   - Alternative: httpOnly cookies (more secure, requires backend changes)
   - Tokens cleared on logout

## CORS Configuration

### Current Settings

```python
ALLOWED_ORIGINS = "http://localhost:5173"  # Development
# Production: ALLOWED_ORIGINS = "https://your-domain.com,https://www.your-domain.com"
```

### CORS Middleware

```python
allow_credentials=True  # Required for authenticated requests
allow_methods=["*"]     # All HTTP methods allowed
allow_headers=["*"]     # All headers allowed
```

### Security Recommendations

1. **Production Setup**:
   ```env
   ALLOWED_ORIGINS=https://your-frontend.com
   ```

2. **Multiple Domains**:
   ```env
   ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
   ```

3. **Avoid Wildcards** in production:
   - ❌ `ALLOWED_ORIGINS=*`
   - ✅ `ALLOWED_ORIGINS=https://specific-domain.com`

## Database Security

### Connection Security

1. **Use SSL/TLS** for database connections in production:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db?ssl=require
   ```

2. **Strong Credentials**:
   - Use complex passwords (20+ characters)
   - Rotate credentials regularly
   - Use database role separation

3. **Network Security**:
   - Restrict database access to application server IPs only
   - Use private networks when possible
   - Enable firewall rules

### SQL Injection Prevention

- **SQLAlchemy ORM** prevents SQL injection by default
- All queries use parameterized statements
- No raw SQL with user input (except in controlled migrations)

### Data Protection

- **Audit Logging**: All data modifications logged
- **Soft Deletes**: Users deactivated, not deleted
- **Backup Strategy**: Implement regular database backups

## Environment Variables

### Required Variables

**Backend (.env)**:
```env
DATABASE_URL=postgresql+asyncpg://...
SECRET_KEY=<32+ character random string>
ALLOWED_ORIGINS=https://your-frontend.com
DEBUG=False
```

**Frontend (.env)**:
```env
VITE_API_BASE_URL=https://your-api.com
```

### Security Best Practices

1. **Never commit .env files** - Use .env.example instead
2. **Validate required variables** on application startup
3. **Use different credentials** for dev/staging/production
4. **Rotate secrets regularly** (quarterly recommended)
5. **Use secret management tools** in production (AWS Secrets Manager, etc.)

## Production Deployment

### Pre-Deployment Checklist

- [ ] Generate secure SECRET_KEY (`openssl rand -hex 32`)
- [ ] Set DEBUG=False
- [ ] Configure production ALLOWED_ORIGINS
- [ ] Use HTTPS/SSL certificates
- [ ] Enable database SSL connections
- [ ] Review and update CORS settings
- [ ] Set up database backups
- [ ] Configure error monitoring (Sentry, etc.)
- [ ] Set up rate limiting (if needed)
- [ ] Review audit log retention policy

### Security Headers

Consider adding security headers middleware:

```python
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

### HTTPS Enforcement

1. **Backend**: Deploy behind HTTPS reverse proxy (nginx, Cloudflare, etc.)
2. **Frontend**: Use HTTPS for all production deployments
3. **Redirect HTTP to HTTPS** automatically

## Security Checklist

### Development

- [x] Password hashing with bcrypt
- [x] JWT token authentication
- [x] Role-based access control
- [x] SQL injection prevention (ORM)
- [x] CORS configuration
- [x] Input validation (frontend & backend)
- [x] Audit logging
- [x] Environment variable configuration
- [ ] Rate limiting (consider implementing)
- [ ] Security headers middleware (recommended)

### Deployment

- [ ] HTTPS/SSL certificates configured
- [ ] SECRET_KEY changed from default
- [ ] DEBUG mode disabled
- [ ] CORS origins restricted to production domains
- [ ] Database credentials secured
- [ ] Database SSL enabled
- [ ] Regular backups configured
- [ ] Error monitoring enabled
- [ ] Security audit conducted
- [ ] Dependency vulnerability scan

### Ongoing Maintenance

- [ ] Regular dependency updates
- [ ] Security patch monitoring
- [ ] Audit log review
- [ ] Access control review
- [ ] Credential rotation
- [ ] Backup testing
- [ ] Incident response plan

## Vulnerability Reporting

If you discover a security vulnerability, please email: [security contact email]

**Do not** create public GitHub issues for security vulnerabilities.

## Compliance

### Data Protection

- User passwords never stored in plaintext
- Audit logs track all data access and modifications
- User data can be exported/deleted on request

### Audit Trail

All system operations are logged with:
- User ID
- Action type
- Timestamp
- IP address
- Resource affected

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [bcrypt Documentation](https://github.com/pyca/bcrypt/)

---

**Last Updated**: 2024-01-15
**Version**: 0.1.0

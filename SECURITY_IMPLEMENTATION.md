# Security Implementation Guide

## Overview
This document outlines all security measures implemented in the Event Management System to make it production-ready.

## ✅ Implemented Security Features

### 1. Authentication & Authorization

#### JWT Token-Based Authentication
- **Implementation**: JWT (JSON Web Tokens) using JJWT library
- **Token Structure**: Contains userId, email, firstName, lastName, role
- **Expiration**: 24 hours for access tokens, 7 days for refresh tokens
- **Signing**: HMAC-SHA256 with Base64-encoded secret key
- **Location**: `backend/*/security/JwtService.java`

#### Password Hashing
- **Algorithm**: BCrypt with strength 10
- **Implementation**: Spring Security's `BCryptPasswordEncoder`
- **Applied to**: User registration and login
- **Location**: `backend/user-service/config/SecurityConfig.java`

#### Role-Based Access Control (RBAC)
- **Roles**: USER, ORGANIZER, ADMIN
- **Implementation**: Spring Security `@PreAuthorize` annotations
- **Endpoints Protected**:
  - **Event Service**: Create/Update/Delete (ORGANIZER+), Publish/Cancel (ORGANIZER+)
  - **Booking Service**: Create (AUTHENTICATED), View own (AUTHENTICATED), Admin operations (ADMIN)
  - **User Service**: All endpoints except auth and health

#### JWT Authentication Filter
- **Implementation**: `JwtAuthenticationFilter` in each service
- **Functionality**:
  - Extracts Bearer token from Authorization header
  - Validates token signature and expiration
  - Sets SecurityContext with user details
  - Skips public endpoints
- **Location**: `backend/*/security/JwtAuthenticationFilter.java`

### 2. API Security

#### Spring Security Configuration
- **Session Management**: Stateless (STATELESS policy)
- **CSRF Protection**: Disabled (stateless API doesn't need it)
- **CORS**: Configured with specific allowed origins
- **Security Headers**: Added via gateway filters
- **Location**: `backend/*/config/SecurityConfig.java`

#### Security Headers (via API Gateway)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1;mode=block
```

#### CORS Configuration
- **Allowed Origins**: Configurable via `CORS_ALLOWED_ORIGINS` environment variable
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, X-Requested-With
- **Credentials**: Allowed with SameSite=Lax
- **Max Age**: 3600 seconds

### 3. Endpoint Protection

#### Public Endpoints (No Authentication Required)
```
POST   /api/users/auth/register
POST   /api/users/auth/login
POST   /api/users/auth/google/login
POST   /api/users/auth/google/register
GET    /api/events (list all)
GET    /api/events/{id}
GET    /api/events/published
GET    /api/events/upcoming
GET    /api/events/featured
GET    /api/events/category/{category}
GET    /api/events/organizer/{id}
GET    /api/events/search
GET    /api/events/paginated
GET    /api/events/{id}/available-seats
GET    /api/events/{id}/exists
GET    /*/health
GET    /actuator/**
```

#### Protected Endpoints (Authentication Required)
```
GET    /api/users (all users)
GET    /api/users/{id}
GET    /api/users/email/{email}
PUT    /api/users/{id}
DELETE /api/users/{id}
GET    /api/users/search
GET    /api/users/role/{role}
POST   /api/bookings
GET    /api/bookings/{id}
GET    /api/bookings/reference/{reference}
DELETE /api/bookings/{id}
GET    /api/bookings/user/{userId}
PUT    /api/bookings/{id}/confirm-payment
PUT    /api/bookings/{id}/cancel
POST   /api/events/{id}/reserve-seats
```

#### Admin-Only Endpoints (ADMIN Role Required)
```
GET    /api/bookings (list all)
PUT    /api/users/{id}/role
PUT    /api/users/{id}/disable
PUT    /api/users/{id}/enable
```

#### Organizer-Only Endpoints (ORGANIZER+ Role Required)
```
POST   /api/events
PUT    /api/events/{id}
DELETE /api/events/{id}
PUT    /api/events/{id}/publish
PUT    /api/events/{id}/cancel
POST   /api/events/{id}/release-seats
GET    /api/bookings/event/{eventId}
GET    /api/bookings/event/{eventId}/revenue
GET    /api/bookings/event/{eventId}/count
```

### 4. Configuration Management

#### Environment Variables
All sensitive configuration is externalized:
```
JWT_SECRET              - JWT signing key (Base64 encoded)
JWT_EXPIRATION          - Token expiration time (ms)
JWT_REFRESH_EXPIRATION  - Refresh token expiration (ms)
SPRING_DATASOURCE_URL   - Database connection URL
SPRING_DATASOURCE_USERNAME - Database user
SPRING_DATASOURCE_PASSWORD - Database password
GOOGLE_CLIENT_ID        - Google OAuth client ID
GOOGLE_CLIENT_SECRET    - Google OAuth client secret
CORS_ALLOWED_ORIGINS    - Allowed CORS origins
NEXT_PUBLIC_API_GATEWAY_URL - Frontend API gateway URL
```

#### Configuration Files
- `backend/user-service/src/main/resources/application.yml`
- `backend/event-service/src/main/resources/application.yml`
- `backend/booking-service/src/main/resources/application.yml`
- `gateway/src/main/resources/application.yml`

### 5. Frontend Security

#### Token Management
- **Storage**: localStorage (with secure flag in production)
- **Transmission**: Authorization header with Bearer scheme
- **Expiration Handling**: Automatic logout on 401 response
- **Location**: `frontend/src/contexts/AuthContext.tsx`

#### API Interceptors
- **Request Interceptor**: Adds Bearer token to all requests
- **Response Interceptor**: Handles 401 errors (token expiration)
- **Location**: `frontend/src/lib/api.ts`

#### Secure Cookie Configuration
```
secure: false (set to true in production with HTTPS)
http-only: true
same-site: lax
```

### 6. Data Protection

#### Password Security
- Passwords are hashed using BCrypt before storage
- Never transmitted in plain text
- Validated on login with BCrypt comparison

#### Sensitive Data
- JWT secrets stored in environment variables
- Database credentials in environment variables
- OAuth secrets in environment variables
- No hardcoded credentials in code

### 7. Input Validation

#### Backend Validation
- **User Registration**: Email format, password length, name length
- **Event Creation**: Title, description, capacity, price validation
- **Booking Creation**: User ID, event ID, ticket count validation
- **Framework**: Jakarta Validation annotations

#### Frontend Validation
- Email format validation
- Password strength requirements
- Required field validation
- Type checking with TypeScript

---

## 🔧 Setup Instructions

### 1. Generate JWT Secret
```bash
# Generate a secure Base64-encoded secret (64 bytes)
openssl rand -base64 64
```

### 2. Set Environment Variables
Create `.env.local` file in project root:
```bash
JWT_SECRET=<your-generated-secret>
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3308/userdb
SPRING_DATASOURCE_USERNAME=useruser
SPRING_DATASOURCE_PASSWORD=userpass
GOOGLE_CLIENT_ID=<your-google-client-id>
CORS_ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
```

### 3. Database Setup
```bash
# Create databases
mysql -u root -p
CREATE DATABASE userdb;
CREATE DATABASE eventdb;
CREATE DATABASE bookingdb;
```

### 4. Build and Run
```bash
# Build all services
mvn clean package -DskipTests

# Run services (see README.md for detailed instructions)
```

---

## 🔐 Production Deployment Checklist

- [ ] Generate new JWT secret for production
- [ ] Set all environment variables in production environment
- [ ] Enable HTTPS/TLS on API Gateway
- [ ] Set `secure: true` on cookies
- [ ] Configure production database with strong credentials
- [ ] Set up database backups
- [ ] Enable audit logging
- [ ] Configure monitoring and alerting
- [ ] Set up rate limiting (recommended: 100 requests/minute per IP)
- [ ] Enable WAF (Web Application Firewall)
- [ ] Configure DDoS protection
- [ ] Set up security scanning in CI/CD
- [ ] Perform security penetration testing
- [ ] Review and update CORS allowed origins
- [ ] Set up log aggregation and analysis
- [ ] Configure automated security updates
- [ ] Document security procedures
- [ ] Train team on security best practices

---

## 🚨 Security Best Practices

### For Developers
1. Never commit secrets to version control
2. Use environment variables for all sensitive data
3. Always validate and sanitize user input
4. Use HTTPS in production
5. Keep dependencies updated
6. Follow OWASP guidelines
7. Implement proper error handling
8. Log security events
9. Use strong passwords
10. Enable MFA for admin accounts

### For Operations
1. Regularly rotate JWT secrets
2. Monitor for suspicious activity
3. Keep systems patched and updated
4. Use strong database credentials
5. Enable database encryption
6. Set up automated backups
7. Monitor API usage patterns
8. Implement rate limiting
9. Use VPN for admin access
10. Regular security audits

### For Users
1. Use strong, unique passwords
2. Never share authentication tokens
3. Log out when finished
4. Report suspicious activity
5. Keep devices updated
6. Use HTTPS connections only
7. Enable two-factor authentication (when available)
8. Don't use public WiFi for sensitive operations
9. Clear browser cache regularly
10. Report security vulnerabilities responsibly

---

## 📋 Security Testing

### Manual Testing
```bash
# Test public endpoint (should work)
curl http://localhost:8080/api/events

# Test protected endpoint without token (should fail)
curl http://localhost:8080/api/users

# Test protected endpoint with token (should work)
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/users

# Test invalid token (should fail)
curl -H "Authorization: Bearer invalid-token" http://localhost:8080/api/users

# Test expired token (should fail)
curl -H "Authorization: Bearer expired-token" http://localhost:8080/api/users
```

### Automated Testing
```bash
# Run security tests
mvn test -Dtest=*SecurityTest

# Run all tests
mvn test
```

---

## 🔄 Token Refresh Flow (Future Enhancement)

Currently, tokens expire after 24 hours. For better UX, implement:

1. **Refresh Token Endpoint**
   ```
   POST /api/users/auth/refresh
   Body: { "refreshToken": "..." }
   Response: { "token": "...", "refreshToken": "..." }
   ```

2. **Frontend Implementation**
   - Store refresh token separately
   - Automatically refresh before expiration
   - Handle refresh token expiration

3. **Backend Implementation**
   - Generate refresh tokens on login
   - Validate refresh tokens
   - Revoke tokens on logout

---

## 📞 Support & Reporting

### Security Issues
- **Do NOT** create public GitHub issues for security vulnerabilities
- Email security concerns to: security@yourdomain.com
- Include: Description, steps to reproduce, impact assessment
- Allow 48 hours for response

### Questions
- Check documentation first
- Ask in team channels
- Consult security guidelines

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Status**: Production Ready (with proper configuration)


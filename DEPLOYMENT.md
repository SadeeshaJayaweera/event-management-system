# Event Management System - Full Stack Setup

## Overview
This is a full-stack event management system with:
- **Backend**: Microservices architecture (Spring Boot + Java)
  - Auth Service (Authentication & User Management)
  - Event Service (Event CRUD operations)
  - Payment Service (PayHere Payment Gateway Integration)
  - Ticket Service (Ticket & Booking Management)
  - Notification Service (Event Notifications)
  - Analytics Service (Analytics & Reporting)
  - Admin Service (System Administration)
  - Profile Service (User Profile Management)
  - API Gateway (Spring Cloud Gateway)
  - Service Discovery (Eureka Server)
  - Config Server (Centralized Configuration)
- **Frontend**: React + Vite + TypeScript with Tailwind CSS
- **Infrastructure**: Docker Compose for orchestration

## Architecture

```
┌─────────────────┐
│   Frontend      │  (Vite + React)
│   Port: 3000    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │  (Spring Cloud Gateway)
│   Port: 8080    │
└────────┬────────┘
         │
    ┌────┴────────────────────────────────────────────────┐
    ▼           ▼          ▼           ▼          ▼        ▼
┌──────┐   ┌──────┐   ┌────────┐  ┌──────┐   ┌────────┐ ┌────────┐
│ Auth │   │Event │   │Payment │  │Ticket│   │Notif.  │ │Analytics
│Service   │Service   │Service │  │Service   │Service │ │Service │
│:8082 │   │:8081 │   │:8083   │  │:8084 │   │:8085   │ │:8086   │
└──┬───┘   └──┬───┘   └────────┘  └──┬───┘   └──┬─────┘ └────────┘
   │          │                       │          │
   ▼          ▼                       ▼          ▼
┌──────┐   ┌──────┐               ┌──────┐   ┌──────┐
│  H2  │   │  H2  │               │  H2  │   │  H2  │
│  DB  │   │  DB  │               │  DB  │   │  DB  │
└──────┘   └──────┘               └──────┘   └──────┘

Additional Services:
- Admin Service (:8087)
- Profile Service (:8088)
- Config Server (:8888)
- Eureka Server (:8761)
```

## Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (for local frontend development)
- Java 17+ / Maven (for local backend development)
- At least 4GB RAM available for Docker

## Quick Start (Production Mode)

### 1. Build and Run with Docker Compose

```bash
# From project root
docker-compose up --build -d
```

This command will:
- Build all backend microservices
- Build the frontend React application
- Start all MySQL databases
- Start service discovery (Eureka)
- Start API Gateway
- Start all microservices
- Serve the frontend via Nginx

###2. Monitor Services

```bash
# View all running containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f gateway
docker-compose logs -f user-service
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Eureka Dashboard**: http://localhost:8761

### 4. Stop the Application

```bash
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## Local Development

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The frontend dev server runs on `http://localhost:3000` and connects to the backend at `http://localhost:8080`.

### Backend Development

Each microservice can be run independently:

```bash
cd backend/auth-service
mvn spring-boot:run
```

**Important**: Ensure the following are running first:
1. Eureka Discovery Server (Port 8761)
2. Config Server (Port 8888 - optional)

**Note**: Services use H2 in-memory databases, no external database setup required.

## API Routes

The API Gateway routes requests as follows:

| Frontend Request | Gateway Route | Backend Service | Port |
|-----------------|---------------|-----------------|------|
| `/api/auth/*` | → | Auth Service | 8082 |
| `/api/users/*` | → | Auth Service | 8082 |
| `/api/events/*` | → | Event Service | 8081 |
| `/api/payment/*` | → | Payment Service | 8083 |
| `/api/tickets/*` | → | Ticket Service | 8084 |
| `/api/notifications/*` | → | Notification Service | 8085 |
| `/api/analytics/*` | → | Analytics Service | 8086 |
| `/api/admin/*` | → | Admin Service | 8087 |
| `/api/profiles/*` | → | Profile Service | 8088 |

## Environment Variables

### Frontend (.env.development / .env.production)

```bash
# API Gateway URL
VITE_API_URL=http://localhost:8080
```

### Backend Services

Each service uses the following environment variables (configured in docker-compose.yml):

```yaml
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery:8761/eureka/
```

**Database Configuration:**
- Services use H2 in-memory databases (no external database required)
- Data persists to Docker volumes for services like auth-service, event-service, etc.
- Payment Service: No database (integrates with PayHere payment gateway)

## Troubleshooting

### Frontend Build Fails

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Backend Service Won't Start

1. Check if Eureka is running: `docker-compose logs discovery`
2. Check service logs: `docker-compose logs [service-name]`
3. Rebuild specific service: `docker-compose up --build [service-name]`
4. Verify all services are registered: http://localhost:8761

### CORS Issues

The API Gateway is configured to allow requests from `http://localhost:3000`. If running on a different port or domain, update `backend/api-gateway/src/main/resources/application.yml`:

```yaml
allowedOrigins: "http://localhost:3000,http://your-domain.com"
```

## Project Structure

```
event-management-system/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── app/                # Application components
│   │   │   ├── components/     # React components
│   │   │   ├── api/           # API client code
│   │   │   └── App.tsx        # Main app component
│   │   ├── styles/            # CSS/Tailwind styles
│   │   └── main.tsx           # Entry point
│   ├── Dockerfile             # Frontend Docker configuration
│   ├── nginx.conf            # Nginx configuration for production
│   ├── package.json
│   └── vite.config.ts
├── backend/                    # Spring Boot microservices
│   ├── config-server/         # Spring Cloud Config Server (Port 8888)
│   ├── eureka-server/         # Eureka Service Discovery (Port 8761)
│   ├── api-gateway/           # API Gateway with JWT Auth (Port 8080)
│   ├── auth-service/          # Authentication & User Management (Port 8082)
│   ├── event-service/         # Event CRUD Operations (Port 8081)
│   ├── payment-service/       # PayHere Payment Integration (Port 8083)
│   ├── ticket-service/        # Ticket & Booking Management (Port 8084)
│   ├── notification-service/  # Event Notifications (Port 8085)
│   ├── analytics-service/     # Analytics & Reporting (Port 8086)
│   ├── admin-service/         # System Administration (Port 8087)
│   └── profile-service/       # User Profile Management (Port 8088)
├── config-repo/               # Centralized configuration repository
└── docker-compose.yml         # Orchestration configuration
```

## Default Credentials

The application starts with no default users. You must register through the frontend:

1. Go to http://localhost:3000
2. Click "Get Started" or "Login"
3. Click "Sign Up"
4. Choose your role (Organizer or Attendee)
5. Fill in registration details

## Testing API Endpoints

### Register a User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "ORGANIZER"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### List Events

```bash
curl http://localhost:8080/api/events
```

## Production Deployment

For production deployment:

1. Update environment variables in `.env.production`
2. Configure proper domain names
3. Set up SSL/TLS certificates
4. Consider using persistent databases (PostgreSQL/MySQL) instead of H2
5. Configure PayHere production credentials in payment-service
6. Implement proper logging and monitoring
7. Set up CI/CD pipeline
8. Enable HTTPS for secure payment processing

## Support

For issues or questions, check:
- Service health endpoints: `http://localhost:8080/actuator/health`
- Eureka dashboard: `http://localhost:8761`
- Individual service logs: `docker-compose logs [service-name]`

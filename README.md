# EventFlow — Event Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Azure](https://img.shields.io/badge/Azure-Container%20Apps-0078D4.svg)](https://azure.microsoft.com/en-us/products/container-apps)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF.svg)](https://github.com/features/actions)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Azure%20Flexible%20Server-336791.svg)](https://azure.microsoft.com/en-us/products/postgresql)

A production-grade **microservices-based event management platform** built with **Spring Boot**, **React + Vite**, deployed on **Microsoft Azure** using a fully automated **CI/CD pipeline**.

---

## Application Preview

<img src="Preview 1.png" alt="EventFlow Landing Page">
<br>
<img src="Preview 2.png" alt="EventFlow Dashboard">
<br>
<img src="Preview 4.png" alt="EventFlow Event Management">
<br>
<img src="Preview 5.png" alt="EventFlow Ticket Purchase">
<br>
<img src="Preview 6.png" alt="EventFlow Analytics">
<br>
<img src="Preview 7.png" alt="EventFlow Profile Management">
<br>
<img src="Preview 8.png" alt="EventFlow Admin Panel">

---

## 🎯 Overview

EventFlow is a comprehensive event management system featuring a **microservices architecture** with **13 independently deployable services**, JWT-based authentication, role-based access control, and a modern React frontend. The platform supports three user roles — **Admin**, **Organizer**, and **Attendee** — with a complete event lifecycle from creation to ticket purchase, payment processing, reviews, and analytics.

**Key Highlights:**
- ✅ 13 microservices (10 backend + API Gateway + Config/Discovery + Frontend)
- ✅ Fully automated CI/CD with GitHub Actions → Azure Container Apps
- ✅ Azure PostgreSQL Flexible Server with per-service schema isolation
- ✅ JWT authentication & role-based authorization
- ✅ PayHere payment gateway integration
- ✅ Email notification system (Gmail SMTP)
- ✅ Event reviews & star ratings
- ✅ User profile management with avatar uploads
- ✅ QR-code ticket generation for attendees
- ✅ Real-time analytics dashboard with charts
- ✅ OpenAPI/Swagger documentation per service
- ✅ Docker multi-stage builds for all services
- ✅ Nginx reverse proxy for the frontend with API pass-through

---

## 🏗️ Architecture

### High-Level Architecture Diagram

```
                                    ┌─────────────────────────┐
                                    │      GitHub Actions      │
                                    │   (CI/CD Pipeline)       │
                                    │  Build → Push ACR →      │
                                    │  Deploy Azure Container  │
                                    └────────────┬────────────┘
                                                 │
                         ┌───────────────────────▼───────────────────────┐
                         │          Azure Container Apps Environment      │
                         │                 (event-app-env)               │
                         │                                               │
    Internet ───────────►│  ┌───────────┐        ┌──────────────────┐   │
                         │  │ Frontend   │──API──►│  API Gateway     │   │
                         │  │ (React +   │  proxy │  (Spring Cloud   │   │
                         │  │  Nginx)    │        │   Gateway)       │   │
                         │  │  :3000     │        │   :8080          │   │
                         │  └───────────┘        └────────┬─────────┘   │
                         │                                │              │
                         │          ┌─────────────────────┼──────────┐  │
                         │          │   Route to Backend Microservices│  │
                         │          │                                 │  │
                         │  ┌───────▼──┐ ┌──────────┐ ┌───────────┐ │  │
                         │  │Auth Svc  │ │Event Svc │ │Ticket Svc │ │  │
                         │  │  :8082   │ │  :8081   │ │  :8084    │ │  │
                         │  └──────────┘ └──────────┘ └───────────┘ │  │
                         │  ┌──────────┐ ┌──────────┐ ┌───────────┐ │  │
                         │  │Payment   │ │Notif Svc │ │Analytics  │ │  │
                         │  │Svc :8083 │ │  :8085   │ │Svc :8086  │ │  │
                         │  └──────────┘ └──────────┘ └───────────┘ │  │
                         │  ┌──────────┐ ┌──────────┐ ┌───────────┐ │  │
                         │  │Admin Svc │ │Profile   │ │Review Svc │ │  │
                         │  │  :8087   │ │Svc :8088 │ │  :8089    │ │  │
                         │  └──────────┘ └──────────┘ └───────────┘ │  │
                         │          │                                 │  │
                         │          └─────────────┬───────────────────┘  │
                         │                        │                      │
                         └────────────────────────┼──────────────────────┘
                                                  │
                                    ┌─────────────▼─────────────┐
                                    │  Azure PostgreSQL Flexible │
                                    │  Server (Single instance,  │
                                    │  per-service schemas)      │
                                    │                            │
                                    │  Schemas:                  │
                                    │  auth_schema               │
                                    │  event_schema              │
                                    │  ticket_schema             │
                                    │  payment_schema            │
                                    │  notification_schema       │
                                    │  analytics_schema          │
                                    │  admin_schema              │
                                    │  profile_schema            │
                                    │  review_schema             │
                                    └────────────────────────────┘
```

### How Services Interact

1. **Frontend (React + Nginx)** — All browser requests to `/api/*` are proxied by Nginx to the **API Gateway** over HTTPS.
2. **API Gateway (Spring Cloud Gateway)** — Central entry point for all API calls. Validates JWT tokens and routes requests to the correct microservice using path-based routing.
3. **Auth Service** — Handles user registration, login, and JWT token issuance. Stores user credentials in `auth_schema`.
4. **Event Service** — Full CRUD for events (create, read, update, delete). Used by organizers and consumed by attendees.
5. **Ticket Service** — Manages ticket purchasing, listing, and QR code generation. Communicates with Event Service and Notification Service internally.
6. **Payment Service** — Integrates with **PayHere** payment gateway. Handles payment initiation, callbacks (notify URL), and redirects (return/cancel URLs). Communicates with Ticket Service.
7. **Notification Service** — Sends email notifications via Gmail SMTP. Called by Ticket Service after purchases. Can also query Event Service and Ticket Service.
8. **Analytics Service** — Aggregates data for dashboard charts (revenue, event stats, attendee counts).
9. **Admin Service** — Provides admin-level operations (user management, system-wide event listing). Communicates with Auth, Event, Ticket, Notification, and Profile services via OpenFeign.
10. **Profile Service** — Manages user profiles, avatars, emergency contacts, and preferences.
11. **Review Service** — Allows attendees to rate and review events. Supports star ratings and text reviews.
12. **Config Server** — Spring Cloud Config Server providing centralized configuration (native file-based).
13. **Eureka Server** — Service discovery (used in Docker Compose local mode; disabled in Azure where direct HTTP URLs are used).

---

## 🧩 Microservices

| # | Service | Port | Database Schema | Description |
|---|---------|------|-----------------|-------------|
| 1 | **Frontend** | 3000 | — | React 18 + Vite + Tailwind CSS SPA served via Nginx |
| 2 | **API Gateway** | 8080 | — | Spring Cloud Gateway — JWT validation, path-based routing, CORS |
| 3 | **Config Server** | 8888 | — | Spring Cloud Config Server (native file-based) |
| 4 | **Eureka Server** | 8761 | — | Netflix Eureka service discovery (local/Docker mode) |
| 5 | **Auth Service** | 8082 | `auth_schema` | User registration, login, JWT issuance, user CRUD |
| 6 | **Event Service** | 8081 | `event_schema` | Event CRUD, search, filtering by organizer |
| 7 | **Ticket Service** | 8084 | `ticket_schema` | Ticket purchase, QR code generation, booking history |
| 8 | **Payment Service** | 8083 | `payment_schema` | PayHere payment gateway integration, refund management |
| 9 | **Notification Service** | 8085 | `notification_schema` | Email notifications via Gmail SMTP, broadcast messages |
| 10 | **Analytics Service** | 8086 | `analytics_schema` | Dashboard analytics, revenue reports, event statistics |
| 11 | **Admin Service** | 8087 | `admin_schema` | Admin dashboard, user management (ban/unban/delete) |
| 12 | **Profile Service** | 8088 | `profile_schema` | User profiles, avatar upload, emergency contacts, preferences |
| 13 | **Review Service** | 8089 | `review_schema` | Event reviews, star ratings, review listing |

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|---|---|
| **Java 17** | Language runtime |
| **Spring Boot 3.2.5** | Microservice framework |
| **Spring Cloud Gateway** | API Gateway with JWT filter |
| **Spring Cloud Netflix Eureka** | Service discovery (local mode) |
| **Spring Cloud Config** | Centralized configuration |
| **Spring Data JPA + Hibernate** | ORM / data access |
| **PostgreSQL** (Azure Flexible Server) | Production database |
| **OpenFeign** | Declarative inter-service HTTP calls |
| **JJWT** | JWT token creation & validation |
| **BCrypt** | Password hashing |
| **SpringDoc OpenAPI 2.3** | Swagger API documentation |
| **Gmail SMTP** | Email delivery (notification-service) |
| **PayHere SDK** | Payment gateway integration |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **Vite** | Build tool & dev server |
| **TypeScript 5.x** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **React Router 6** | Client-side routing |
| **Radix UI** | Accessible UI primitives |
| **Recharts** | Analytics charts |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |

### DevOps & Infrastructure
| Technology | Purpose |
|---|---|
| **Docker** | Containerization (multi-stage builds) |
| **Docker Compose** | Local orchestration |
| **Nginx** | Frontend static file serving + API reverse proxy |
| **GitHub Actions** | CI/CD pipeline |
| **Azure Container Registry (ACR)** | Docker image registry |
| **Azure Container Apps** | Serverless container hosting |
| **Azure PostgreSQL Flexible Server** | Managed PostgreSQL database |

---

## 🔄 CI/CD Pipeline

The project uses a **GitHub Actions** workflow (`.github/workflows/deploy.yml`) that is triggered on every push to `main`/`master` or via manual dispatch.

### Pipeline Stages

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Checkout    │────►│  Build & Push    │────►│  Deploy to Azure    │
│  Code        │     │  Docker Images   │     │  Container Apps     │
│              │     │  to ACR          │     │                     │
└─────────────┘     └──────────────────┘     └─────────────────────┘
```

**Stage 1: `build_and_push`**
1. Checks out the repository
2. Logs in to Azure Container Registry (ACR) using `ACR_USERNAME` / `ACR_PASSWORD` secrets
3. Iterates over all 13 services and for each:
   - Builds a Docker image tagged with the commit SHA and `latest`
   - Pushes both tags to ACR (`eventmgmtacrsadeesha.azurecr.io`)

**Stage 2: `deploy`**
1. Logs in to Azure using `AZURE_CREDENTIALS` service principal
2. For each service, updates the Azure Container App with:
   - The new image (`commit SHA` tag)
   - Environment variables: database connection strings, mail credentials, PayHere keys, inter-service URLs
   - Scaling configuration: `min-replicas=1` (prevents cold starts), `max-replicas=3`
   - Resource allocation: CPU and memory per service

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `ACR_USERNAME` | Azure Container Registry username |
| `ACR_PASSWORD` | Azure Container Registry password |
| `AZURE_CREDENTIALS` | Azure service principal JSON credentials |
| `DB_HOST` | Azure PostgreSQL server hostname |
| `DB_USER` | PostgreSQL admin username |
| `DB_PASSWORD` | PostgreSQL admin password |
| `NOTIFICATION_MAIL_USERNAME` | Gmail address for sending notifications |
| `NOTIFICATION_MAIL_PASSWORD` | Gmail app password |
| `PAYHERE_MERCHANT_ID` | PayHere merchant ID |
| `PAYHERE_MERCHANT_SECRET` | PayHere merchant secret |
| `FRONTEND_URL` | Public URL of the frontend (for payment redirects) |
| `BACKEND_API_URL` | Public URL of the API gateway (for payment notify callbacks) |

---

## ✨ Features

### Authentication & Security
- ✅ JWT-based stateless authentication
- ✅ BCrypt password hashing
- ✅ Role-based access control (Admin, Organizer, Attendee)
- ✅ API Gateway JWT filter on all `/api/**` routes (except `/api/auth/**`)
- ✅ Protected frontend routes with `<ProtectedRoute>` component
- ✅ CORS configuration on the gateway

### User Roles

| Role | Capabilities |
|---|---|
| **Admin** | System-wide dashboard, user management (view/delete/ban/unban), all event management, access to all features |
| **Organizer** | Create & manage own events, view attendee lists, track ticket sales, event analytics, broadcast messages |
| **Attendee** | Browse & discover events, purchase tickets, download QR-code tickets, view booking history, rate & review events, manage profile & preferences, set emergency contacts |

### Core Features
| Feature | Description |
|---|---|
| 📅 **Event Management** | Full CRUD — create, update, delete, list, search, and filter events |
| 🎫 **Ticket Purchasing** | Buy tickets for events, receive QR-code tickets for download |
| 💳 **Payment Processing** | PayHere payment gateway integration with return/cancel/notify URLs |
| 📊 **Analytics Dashboard** | Charts for revenue, event statistics, and attendee counts (Recharts) |
| 📧 **Email Notifications** | Automated email notifications on ticket purchase and event updates |
| 📢 **Broadcast Messages** | Organizers can send messages to all event attendees |
| ⭐ **Reviews & Ratings** | Attendees can rate events with star ratings and text reviews |
| 👤 **Profile Management** | Avatar upload, bio, emergency contacts, notification preferences |
| 🔍 **Event Discovery** | Search & filter events by name, category, date, etc. |
| 🛡️ **Admin Panel** | User management, system-wide analytics, event oversight |
| 💰 **Refunds Management** | Handle payment refunds through the admin/organizer dashboard |

---

## 📚 API Endpoints

All endpoints are accessible through the **API Gateway** at the deployed Azure URL or locally at `http://localhost:8080`.

### Authentication — `/api/auth`
```
POST   /api/auth/register         # Register a new user
POST   /api/auth/login            # Login and receive JWT token
```

### Users — `/api/users`
```
GET    /api/users                  # List all users (Admin)
GET    /api/users/{id}             # Get user by ID
DELETE /api/users/{id}             # Delete user (Admin)
```

### Events — `/api/events`
```
GET    /api/events                 # List all events
POST   /api/events                 # Create event (Organizer/Admin)
GET    /api/events/{id}            # Get event details
PUT    /api/events/{id}            # Update event (Organizer/Admin)
DELETE /api/events/{id}            # Delete event (Admin)
```

### Tickets — `/api/tickets`
```
GET    /api/tickets                # List tickets (by user)
POST   /api/tickets                # Purchase a ticket
GET    /api/tickets/{id}           # Get ticket details
```

### Payments — `/api/payment`
```
POST   /api/payment/initiate      # Initiate a PayHere payment
POST   /api/payment/notify        # PayHere server notification callback
GET    /api/payment/status/{id}   # Check payment status
```

### Notifications — `/api/notifications`
```
GET    /api/notifications          # List notifications for user
POST   /api/notifications          # Create/send notification
POST   /api/notifications/broadcast # Broadcast message to event attendees
```

### Analytics — `/api/analytics`
```
GET    /api/analytics/overview     # System overview statistics
GET    /api/analytics/revenue      # Revenue data
```

### Admin — `/api/admin`
```
GET    /api/admin/dashboard/stats  # Admin dashboard statistics
GET    /api/admin/events           # All events (admin view)
GET    /api/admin/users            # All users (admin view)
DELETE /api/admin/users/{id}       # Delete user
PUT    /api/admin/users/{id}/ban   # Ban/unban user
```

### Profiles — `/api/profiles`
```
GET    /api/profiles/{userId}      # Get user profile
PUT    /api/profiles/{userId}      # Update user profile
POST   /api/profiles/{userId}/avatar # Upload avatar
GET    /api/profiles/{userId}/emergency-contacts # Get emergency contacts
PUT    /api/profiles/{userId}/emergency-contacts # Update emergency contacts
GET    /api/profiles/{userId}/preferences        # Get preferences
PUT    /api/profiles/{userId}/preferences        # Update preferences
```

### Reviews — `/api/reviews`
```
GET    /api/reviews                # List reviews (by event)
POST   /api/reviews                # Submit a review
GET    /api/reviews/{id}           # Get review details
PUT    /api/reviews/{id}           # Update review
DELETE /api/reviews/{id}           # Delete review
```

> **Security:** All endpoints (except `/api/auth/**`) require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## 🚀 Deployment

### Azure Production (Current Deployment)

The application is deployed to **Azure Container Apps** with the following infrastructure:

| Azure Resource | Name | Purpose |
|---|---|---|
| **Resource Group** | `event-management-rg` | Logical grouping of all resources |
| **Container Registry** | `eventmgmtacrsadeesha.azurecr.io` | Docker image repository |
| **Container Apps Environment** | `event-app-env` | Shared hosting environment |
| **PostgreSQL Flexible Server** | `eventmgmt-pg-db` | Managed PostgreSQL (9 schemas) |

**Services with external ingress (public):** API Gateway, Frontend  
**Services with internal ingress (private):** All other microservices

### Azure Database Schema Isolation

Each microservice has its own PostgreSQL schema within a single Azure PostgreSQL database (`postgres`):

| Schema | Service |
|---|---|
| `auth_schema` | Auth Service |
| `event_schema` | Event Service |
| `ticket_schema` | Ticket Service |
| `payment_schema` | Payment Service |
| `notification_schema` | Notification Service |
| `analytics_schema` | Analytics Service |
| `admin_schema` | Admin Service |
| `profile_schema` | Profile Service |
| `review_schema` | Review Service |

### Local Development with Docker Compose

```bash
git clone https://github.com/SadeeshaJayaweera/event-management-system.git
cd event-management-system
docker-compose up --build
```

**Local access:**
- 🌐 Frontend: http://localhost:3000
- 🌉 API Gateway: http://localhost:8080
- 🔍 Eureka Dashboard: http://localhost:8761

### Building Individual Services

```bash
# Build a single backend service
cd backend/event-service
mvn clean package -DskipTests

# Build the frontend
cd frontend
npm install
npm run build
```

### Docker Commands

```bash
docker-compose up --build      # Build and start all services
docker-compose down            # Stop all services
docker-compose logs -f         # View all logs
docker-compose logs -f event-service  # View logs for a specific service
docker-compose ps              # List running containers
docker-compose down -v         # Stop and remove volumes
```

---

## 📁 Project Structure

```
event-management-system/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD pipeline
├── azure_setup_scripts/
│   ├── create_schemas.sh           # Create PostgreSQL schemas
│   ├── fix_hibernate_schemas.sh    # Fix Hibernate schema config
│   ├── fix_pool_size.sh            # Fix connection pool settings
│   └── fix_services_azure_pg.sh    # Migrate services to Azure PostgreSQL
├── backend/
│   ├── api-gateway/                # Spring Cloud Gateway (JWT + routing)
│   ├── config-server/              # Spring Cloud Config Server
│   ├── eureka-server/              # Netflix Eureka discovery
│   ├── auth-service/               # Authentication & user management
│   ├── event-service/              # Event CRUD operations
│   ├── ticket-service/             # Ticket purchasing & QR codes
│   ├── payment-service/            # PayHere payment integration
│   ├── notification-service/       # Email notifications (Gmail SMTP)
│   ├── analytics-service/          # Analytics & reporting
│   ├── admin-service/              # Admin operations (OpenFeign)
│   ├── profile-service/            # User profiles & emergency contacts
│   └── review-service/             # Event reviews & star ratings
├── config-repo/
│   └── application.yml             # Shared Spring Cloud Config
├── frontend/
│   ├── Dockerfile                  # Multi-stage build (Node → Nginx)
│   ├── nginx.conf                  # Nginx config with API proxy
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx             # Route definitions
│   │   │   ├── components/         # Reusable UI components
│   │   │   ├── contexts/           # Auth context (JWT state)
│   │   │   ├── layouts/            # OrganizerLayout, AttendeeLayout
│   │   │   ├── pages/              # Page-level components
│   │   │   └── services/           # API client & service layer
│   │   └── styles/                 # Global CSS
│   └── package.json
├── docker-compose.yml              # Local orchestration (all 13 services)
├── setup_azure.sh                  # Azure infrastructure setup script
├── build.sh                        # Build all services locally
└── README.md
```

---

## 🔧 Configuration

### Frontend — Nginx Reverse Proxy

The frontend Nginx config (`frontend/nginx.conf`) proxies all `/api/*` requests to the API Gateway's Azure Container App URL:

```nginx
location /api/ {
    proxy_pass https://api-gateway.<env-id>.eastus.azurecontainerapps.io/api/;
    ...
}
```

For local development, this points to `http://gateway:8080` via Docker networking.

### Backend — JWT Configuration

The same JWT secret must be configured in both:
- `backend/auth-service/src/main/resources/application.yml`
- `backend/api-gateway/src/main/resources/application.yml`

```yaml
jwt:
  secret: <base64-encoded-secret>
  expiration: 86400000  # 24 hours
```

### Backend — Database

All services default to the Azure PostgreSQL instance. For local development, update `application.yml` or provide environment variables:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://<host>:5432/postgres?currentSchema=<schema>&sslmode=require}
    username: ${SPRING_DATASOURCE_USERNAME:<user>}
    password: ${SPRING_DATASOURCE_PASSWORD:<password>}
```

---

## 🔐 Security

### Implemented
- ✅ JWT token-based stateless authentication
- ✅ BCrypt password hashing
- ✅ API Gateway JWT validation filter
- ✅ Role-based access control (Admin / Organizer / Attendee)
- ✅ Protected frontend routes
- ✅ CORS configuration on API Gateway
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- ✅ SSL/TLS for Azure PostgreSQL connections (`sslmode=require`)
- ✅ Internal ingress for backend services (not publicly accessible)
- ✅ Secrets managed via GitHub Secrets & Azure environment variables

### Production Recommendations
- 🔒 Rotate JWT secrets periodically
- 🔒 Use Azure Key Vault for secret management
- 🔒 Enable rate limiting on the API Gateway
- 🔒 Set up Azure Monitor / Application Insights for observability
- 🔒 Configure WAF (Web Application Firewall) for the frontend

---

## 🐛 Troubleshooting

**Services not connecting on Azure:**
- Verify all Container Apps are in the same environment (`event-app-env`)
- Check that internal services have `internal` ingress
- Review Container App logs: `az containerapp logs show -n <service> -g event-management-rg`

**JWT token errors:**
- Verify JWT secrets match between `auth-service` and `api-gateway`
- Check token expiration (default 24 hours)

**Database connection issues:**
- Verify the PostgreSQL server firewall allows Azure Container Apps
- Check schema existence: run `azure_setup_scripts/create_schemas.sh`
- Verify connection pool settings (HikariCP `maximum-pool-size`)

**CI/CD build failures:**
- Ensure all service directories exist in the repo and match the paths in `deploy.yml`
- Check that GitHub Secrets are correctly configured
- Review the Actions log: `https://github.com/<repo>/actions`

**Docker issues (local):**
```bash
docker-compose down -v
docker system prune -f
docker-compose up --build
```

**Cold start delays on Azure:**
- All services are configured with `min-replicas=1` to prevent cold starts
- If experiencing slow first requests, check the Container App revision logs

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows existing patterns and project conventions
- JWT authentication flow is maintained
- Role-based access control is respected
- New services are added to the CI/CD pipeline (`deploy.yml`)
- Documentation is updated

---

## 📞 Support

- **Azure Container App Logs:** `az containerapp logs show -n <service-name> -g event-management-rg`
- **GitHub Actions:** Check the [Actions tab](https://github.com/SadeeshaJayaweera/event-management-system/actions) for build/deploy status
- **API Health Check:** `GET /actuator/health` on each service
- **Swagger Docs:** `GET /swagger-ui.html` on individual services (when accessible)

---

**Version:** 2.0.0 | **Status:** Production (Azure) | **License:** MIT

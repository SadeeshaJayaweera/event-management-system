# Event Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black.svg)](https://nextjs.org/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

A microservices-based event management platform built with **Spring Boot** and **Next.js**.

> � **Status:** Development Version - **NOT Production Ready**  
> 🔒 **Security Notice:** Critical security vulnerabilities exist - See Security section below  
> 📚 **Complete Guide:** See [GUIDE.md](GUIDE.md) for detailed documentation

---

## Application Preview 

<img src="Preview1.png">
<br>
<img src="Preview2.png">
<br>

🧑‍💼 Organizer Dashboard

<img src="Preview3.png" width="800"/> <br><br> <img src="Preview4.png" width="800"/> <br><br>
<br>

🎟️ Attendee Dashboard

<img src="Preview5.png">

## 🎯 What's This?

A microservices-based event management system with a modern web interface. The application demonstrates a complete microservices architecture with service discovery, API gateway, and inter-service communication.

**Current State:** Core features implemented, but **security measures are not yet in place**. This is a development version suitable for learning, experimentation, or as a starter template that requires security hardening before production use.

---

## 🚀 Quick Start

### Using Docker (Easiest - 5 Minutes)

```bash
git clone https://github.com/HasithFernando/event-management-system.git
cd event-management-system
docker-compose up --build
```

**Then access:**
- 🌐 Frontend: http://localhost:3000
- 🔍 Eureka Dashboard: http://localhost:8761
- 🌉 API Gateway: http://localhost:8080

### Local Development Setup

Follow these steps to run the application locally without Docker:

#### Step 1: Clone the Repository
```bash
git clone https://github.com/SadeeshaJayaweera/event-management-system.git
cd event-management-system
```

#### Step 2: Start Infrastructure Services (in separate terminals)

**Terminal 1 - Discovery Server (Eureka):**
```bash
cd discovery
mvn spring-boot:run
```
Wait for: "Started EurekaServerApplication" message (usually ~30-40 seconds)  
Verify at: http://localhost:8761

**Terminal 2 - Config Server:**
```bash
cd config-server
mvn spring-boot:run
```
Wait for: "Started ConfigServerApplication" and registration with Eureka

**Terminal 3 - API Gateway:**
```bash
cd gateway
mvn spring-boot:run
```
Wait for: "Started GatewayApplication" message  
Verify at: http://localhost:8080/actuator/health

#### Step 3: Start Business Services (in separate terminals)

**Terminal 4 - User Service:**
```bash
cd backend/user-service
mvn spring-boot:run
```
Verify at: http://localhost:8082/users/health

**Terminal 5 - Event Service:**
```bash
cd backend/event-service
mvn spring-boot:run
```
Verify at: http://localhost:8081/events/health

**Terminal 6 - Booking Service:**
```bash
cd backend/booking-service
mvn spring-boot:run
```
Verify at: http://localhost:8083/bookings/health

#### Step 4: Start Frontend

**Terminal 7 - Next.js Frontend:**
```bash
cd frontend
npm install           # Only needed first time
npm run dev
```
Access at: http://localhost:3000

#### Step 5: Verify All Services

Check Eureka Dashboard at http://localhost:8761 - you should see:
- ✅ GATEWAY-SERVICE
- ✅ USER-SERVICE
- ✅ EVENT-SERVICE
- ✅ BOOKING-SERVICE

### Quick Start Commands (All at Once)

If you prefer to start everything in one go, use the provided script:

```bash
# Make script executable (first time only)
chmod +x start-all.sh

# Start all services
./start-all.sh
```

**Note:** Services use H2 in-memory database by default for local development. Data will be lost when services restart.

### Stopping Services

Press `Ctrl+C` in each terminal to stop individual services.

For the full guide with troubleshooting, see [GUIDE.md](GUIDE.md).

---

## 📋 Prerequisites

**For Docker (Recommended):**
- Docker Desktop

**For Local Development:**
- Java 17+
- Maven 3.6+
- Node.js 18+

---

## 🏗️ Architecture

```
Frontend (Next.js) → API Gateway → Microservices → Databases
                          ↓
                   Discovery Server
                   Config Server
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | 3000 | Next.js web application |
| **API Gateway** | 8080 | Single entry point |
| **Discovery Server** | 8761 | Service registry (Eureka) |
| **Config Server** | 8888 | Centralized configuration |
| **Event Service** | 8081 | Event management |
| **User Service** | 8082 | User management |
| **Booking Service** | 8083 | Booking management |

### Technology Stack

- **Backend:** Spring Boot 3.2.1, Java 17
- **Frontend:** Next.js 14, React 18, TypeScript 5.3
- **Service Discovery:** Netflix Eureka
- **API Gateway:** Spring Cloud Gateway
- **Databases:** MySQL 8.0 (H2 for development)
- **Containerization:** Docker & Docker Compose

---

## 📁 Project Structure

```
event-management-system/
│
├── backend/                           # Business microservices
│   ├── event-service/                 # Event management service (Port 8081)
│   │   ├── src/main/java/com/nsbm/eventservice/
│   │   │   ├── controller/            # REST endpoints
│   │   │   ├── service/               # Business logic
│   │   │   ├── repository/            # Data access
│   │   │   ├── model/                 # Entity models
│   │   │   ├── dto/                   # Data transfer objects
│   │   │   ├── exception/             # Custom exceptions
│   │   │   └── util/                  # Utility classes
│   │   ├── src/main/resources/
│   │   │   └── application.yml        # Service configuration
│   │   └── pom.xml                    # Maven dependencies
│   │
│   ├── user-service/                  # User management service (Port 8082)
│   │   ├── src/main/java/com/nsbm/userservice/
│   │   │   ├── controller/            # UserController
│   │   │   ├── service/               # UserService
│   │   │   ├── repository/            # UserRepository
│   │   │   ├── model/                 # User, Role entities
│   │   │   ├── dto/                   # RegisterRequest, LoginRequest, etc.
│   │   │   └── exception/             # Error handlers
│   │   ├── src/main/resources/
│   │   │   └── application.yml
│   │   └── pom.xml
│   │
│   └── booking-service/               # Booking management service (Port 8083)
│       ├── src/main/java/com/nsbm/bookingservice/
│       │   ├── controller/            # BookingController
│       │   ├── service/               # BookingService
│       │   ├── repository/            # BookingRepository
│       │   ├── client/                # Feign clients (EventServiceClient)
│       │   ├── model/                 # Booking entity
│       │   └── dto/                   # Booking DTOs
│       ├── src/main/resources/
│       │   └── application.yml
│       └── pom.xml
│
├── discovery/                         # Eureka Server (Port 8761)
│   ├── src/main/java/com/nsbm/discovery/
│   │   └── DiscoveryServerApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
│
├── config-server/                     # Config Server (Port 8888)
│   ├── src/main/java/com/nsbm/configserver/
│   │   └── ConfigServerApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── config-repo/               # Configuration repository
│   └── pom.xml
│
├── gateway/                           # API Gateway (Port 8080)
│   ├── src/main/java/com/nsbm/gateway/
│   │   └── GatewayApplication.java
│   ├── src/main/resources/
│   │   └── application.yml            # Route configurations
│   └── pom.xml
│
├── frontend/                          # Next.js Application (Port 3000)
│   ├── src/
│   │   ├── app/                       # Next.js 14 App Router
│   │   │   ├── auth/                  # Authentication pages
│   │   │   │   ├── login/             # Login page
│   │   │   │   └── register/          # Registration page
│   │   │   ├── events/                # Event pages
│   │   │   │   ├── [id]/              # Event details (dynamic)
│   │   │   │   └── create/            # Create event page
│   │   │   ├── bookings/              # Bookings page
│   │   │   ├── profile/               # User profile page
│   │   │   ├── layout.tsx             # Root layout
│   │   │   ├── page.tsx               # Home page
│   │   │   └── globals.css            # Global styles
│   │   ├── components/                # Reusable components
│   │   │   ├── Navbar.tsx
│   │   │   └── EventCard.tsx
│   │   ├── contexts/                  # React contexts
│   │   │   └── AuthContext.tsx        # Authentication state
│   │   ├── services/                  # API service layer
│   │   │   ├── userService.ts
│   │   │   ├── eventService.ts
│   │   │   └── bookingService.ts
│   │   ├── lib/                       # Utilities
│   │   │   └── api.ts                 # Axios configuration
│   │   └── types/                     # TypeScript types
│   │       └── index.ts
│   ├── public/                        # Static assets
│   ├── package.json                   # NPM dependencies
│   └── tailwind.config.ts             # Tailwind CSS config
│
├── config-repo/                       # Centralized configurations
│   └── application.yml                # Shared configuration
│
├── logs/                              # Application logs
│
├── docker-compose.yml                 # Docker orchestration
├── build.sh / build.bat               # Build scripts
├── start-all.sh                       # Start all services script
├── stop-all.sh                        # Stop all services script
│
├── README.md                          # Project overview (this file)
├── GUIDE.md                           # Complete development guide
├── GITHUB_ISSUES.md                   # List of issues/enhancements
├── LICENSE                            # MIT License
├── .gitignore                         # Git ignore rules
└── package.json                       # Root package configuration
```

### Key Directories Explained

**Backend Services:**
- Each service follows the standard Spring Boot structure
- Clean architecture: Controller → Service → Repository → Model
- DTOs for data transfer between layers
- Custom exception handling

**Frontend:**
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Separated concerns: components, services, contexts

**Infrastructure:**
- Discovery Server for service registration
- Config Server for centralized configuration
- API Gateway for routing and load balancing

---

## 🛠️ Development

### Quick Commands

**Backend (Maven):**
```bash
mvn spring-boot:run          # Run service
mvn clean package            # Build
mvn test                     # Run tests
```

**Frontend (NPM):**
```bash
npm install                  # Install dependencies
npm run dev                  # Development mode
npm run build                # Build for production
```

**Docker:**
```bash
docker-compose up            # Start all services
docker-compose down          # Stop all services
docker-compose logs -f       # View logs
docker-compose ps            # List running containers
```

### Implementation Status

✅ **Infrastructure (100%)**
- Complete microservices setup
- Service discovery and registration
- API Gateway with routing
- Docker configuration
- Database setup

✅ **Backend Services (90%)**
- Entity models and DTOs
- REST API implementations
- Service layer business logic
- Exception handling
- Inter-service communication (Feign clients)
- Validation

🔨 **User Service**
- ✅ User registration and login
- ✅ User CRUD operations
- ✅ Role-based user management
- ✅ User search functionality
- ❌ Password hashing (CRITICAL - stores plaintext)
- ❌ JWT authentication implementation
- ❌ Authorization controls

🔨 **Event Service**
- ✅ Event CRUD operations
- ✅ Event publishing and status management
- ✅ Category-based filtering
- ✅ Search functionality
- ✅ Seat reservation management
- ✅ Featured/upcoming events

🔨 **Booking Service**
- ✅ Booking creation and management
- ✅ Payment confirmation workflow
- ✅ Booking cancellation
- ✅ Revenue analytics
- ✅ User and event-based queries

✅ **Frontend (95%)**
- Modern Next.js 14 with TypeScript
- Responsive UI with Tailwind CSS
- Authentication context (login/register)
- Event listing and creation pages
- Event details page
- Booking management
- User profile
- API integration with services

❌ **Security (0% - CRITICAL)**
- ❌ No password encryption
- ❌ No JWT authentication
- ❌ No authorization/access control
- ❌ No CSRF protection
- ❌ No rate limiting
- ❌ Hardcoded credentials in config files

❌ **Testing (10%)**
- Basic test structure present
- Comprehensive tests needed


---

## 📚 API Endpoints

All endpoints are accessible through the API Gateway at `http://localhost:8080`

### User Service (`/api/users`)

**Authentication:**
```
POST   /api/users/auth/register    # Register new user
POST   /api/users/auth/login       # User login
```

**User Management:**
```
GET    /api/users                  # List all users
GET    /api/users/{id}             # Get user by ID
GET    /api/users/email/{email}    # Get user by email
PUT    /api/users/{id}             # Update user
DELETE /api/users/{id}             # Delete user
```

**Admin Operations:**
```
PUT    /api/users/{id}/role        # Update user role
PUT    /api/users/{id}/disable     # Disable user
PUT    /api/users/{id}/enable      # Enable user
```

**Search:**
```
GET    /api/users/search?query=    # Search users
GET    /api/users/role/{role}      # Get users by role
```

### Event Service (`/api/events`)

**CRUD Operations:**
```
POST   /api/events                 # Create event
GET    /api/events                 # List all events
GET    /api/events/{id}            # Get event by ID
PUT    /api/events/{id}            # Update event
DELETE /api/events/{id}            # Delete event
```

**Event Queries:**
```
GET    /api/events/published       # Get published events
GET    /api/events/upcoming        # Get upcoming events
GET    /api/events/featured        # Get featured events
GET    /api/events/category/{cat}  # Get events by category
GET    /api/events/organizer/{id}  # Get events by organizer
GET    /api/events/search?query=   # Search events
GET    /api/events/paginated       # Paginated events
```

**Event Management:**
```
PUT    /api/events/{id}/publish    # Publish event
PUT    /api/events/{id}/cancel     # Cancel event
```

**Seat Management:**
```
POST   /api/events/{id}/reserve-seats?numberOfSeats=N   # Reserve seats
POST   /api/events/{id}/release-seats?numberOfSeats=N   # Release seats
GET    /api/events/{id}/available-seats?numberOfSeats=N # Check availability
```

### Booking Service (`/api/bookings`)

**CRUD Operations:**
```
POST   /api/bookings               # Create booking
GET    /api/bookings               # List all bookings
GET    /api/bookings/{id}          # Get booking by ID
GET    /api/bookings/reference/{ref} # Get by reference
DELETE /api/bookings/{id}          # Delete booking
```

**Queries:**
```
GET    /api/bookings/user/{userId}    # Get user's bookings
GET    /api/bookings/event/{eventId}  # Get event's bookings
```

**Status Management:**
```
PUT    /api/bookings/{id}/confirm-payment  # Confirm payment
PUT    /api/bookings/{id}/cancel           # Cancel booking
```

**Analytics:**
```
GET    /api/bookings/event/{eventId}/revenue  # Get event revenue
GET    /api/bookings/event/{eventId}/count    # Get booking count
```

> ⚠️ **Security Warning:** All endpoints are currently publicly accessible without authentication. This is a critical security vulnerability that must be addressed before production use.

---

## 🔧 Configuration

### Frontend Environment

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
```

### Backend Configuration

Each service has its own `application.yml` in `src/main/resources/`


## 🐛 Troubleshooting

### Services not showing in Eureka
- Wait 30-60 seconds for registration
- Ensure Discovery Server started first

### Port already in use
- Check and stop conflicting services
- Or change ports in `application.yml`

### Docker issues
```bash
docker-compose down -v       # Reset everything
docker system prune -f       # Clean up
```

For detailed troubleshooting, see [GUIDE.md](GUIDE.md).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Features

### ✅ Implemented Features

- ✨ **Microservices Architecture** - 3 business services + infrastructure
- 🔄 **Service Discovery & Registration** - Netflix Eureka
- 🌉 **API Gateway Pattern** - Spring Cloud Gateway with route mapping
- ⚙️ **Centralized Configuration** - Config Server ready
- 🐳 **Docker Ready** - Complete docker-compose setup
- 📱 **Modern React Frontend** - Next.js 14 + TypeScript + Tailwind CSS
- 💾 **Database Per Service** - MySQL (H2 for development)
- 📊 **Health Monitoring** - Actuator endpoints
- 📚 **Comprehensive Documentation** - Detailed guides and API docs

### 🚀 Business Features

- **User Management**: Registration, login, profile management, role-based access
- **Event Management**: Create, publish, search, categorize events with seat management
- **Booking System**: Complete booking workflow with payment confirmation and cancellation
- **Search & Filter**: Full-text search across users and events
- **Analytics**: Revenue tracking and booking statistics
- **Responsive UI**: Mobile-friendly interface with modern design

### ⚠️ Missing Features (Security First!)

- 🔒 **Authentication & Authorization** - JWT implementation needed
- 🔐 **Password Encryption** - BCrypt hashing required
- 🛡️ **Security Headers** - CORS, CSRF, XSS protection
- ⏱️ **Rate Limiting** - Prevent brute force attacks
- 🧪 **Comprehensive Testing** - Unit, integration, and E2E tests
- 📧 **Email Notifications** - Booking confirmations, event updates
- 💳 **Payment Integration** - Stripe/PayPal integration
- 📊 **Advanced Analytics** - Dashboard with charts and reports

---

## 👥 Built For Teams

This boilerplate is designed for team development with:
- Clear project structure
- Comprehensive documentation
- Easy local setup
- Docker support
- Git-ready configuration

---

## 🤝 Contributing

Contributions are welcome! Please ensure:
- All new features include tests
- Security best practices are followed
- Code follows existing patterns
- Documentation is updated

---

## 📝 Next Steps

To make this production-ready:

1. **Security (Critical)**
   - Implement BCrypt password hashing
   - Add JWT authentication system
   - Configure Spring Security
   - Add CSRF protection
   - Implement rate limiting

2. **Testing**
   - Write unit tests for services
   - Add integration tests
   - Implement E2E tests

3. **Features**
   - Email notification system
   - Payment gateway integration
   - Advanced search and filters
   - Admin dashboard

4. **DevOps**
   - CI/CD pipeline
   - Automated security scanning
   - Performance monitoring
   - Log aggregation

---

**Ready to build, but secure it first!** �

For questions, issues, or contributions, please open a GitHub issue.

**Version:** 0.2.0-dev | **Status:** Development - NOT Production Ready | **License:** MIT

# Admin Service

The Admin Service is a Spring Boot microservice that provides administrative functionality for the Event Management System. It aggregates data from various microservices to provide a unified interface for managing events, users, and viewing dashboard analytics.

## ⚠️ Important: Admin Access Control

**Role Requirements**: Only users with the `admin` role can access admin panel features. Regular `organizer` users do not have admin privileges.

**Security Note**: In the current implementation, admin endpoints rely on role checking at the frontend level. For production deployments, implement proper backend authentication and authorization using Spring Security with JWT validation and role-based access control (RBAC).

**Setup**: See [ADMIN_SETUP.md](../../ADMIN_SETUP.md) for instructions on creating admin users.

## Features

### 1. Event Management
- View all events
- View specific event details
- Update event information
- Delete events

### 2. User Management
- View all users
- View specific user details
- Delete users
- Ban/unban users

### 3. Dashboard Analytics
- Total events count
- Upcoming events count
- Completed events count
- Total users count
- Total attendees count
- Total tickets sold

## Technology Stack

- **Spring Boot 3.2.5**: Framework for building the microservice
- **Spring Cloud**: For microservices architecture
- **Netflix Eureka Client**: Service discovery
- **OpenFeign**: Declarative REST client for inter-service communication
- **Maven**: Dependency management and build tool

## Configuration

### Application Properties
- **Port**: 8087
- **Service Name**: admin-service
- **Eureka Server**: http://eureka-server:8761/eureka/

### Dependencies
The service communicates with:
- `event-service` - For event management operations
- `auth-service` - For user management operations
- `attendee-service` - For attendee statistics
- `ticket-service` - For ticket statistics

## API Endpoints

### Dashboard Analytics

#### Get Dashboard Statistics
```
GET /api/admin/dashboard/stats
```
Returns aggregated statistics for the admin dashboard.

**Response:**
```json
{
  "totalEvents": 100,
  "upcomingEvents": 45,
  "completedEvents": 55,
  "totalUsers": 500,
  "totalAttendees": 1200,
  "totalTicketsSold": 3500
}
```

### Event Management

#### Get All Events
```
GET /api/admin/events
```
Returns a list of all events in the system.

#### Get Event by ID
```
GET /api/admin/events/{id}
```
Returns details of a specific event.

#### Update Event
```
PUT /api/admin/events/{id}
```
Updates an existing event.

**Request Body:**
```json
{
  "title": "Updated Event Title",
  "category": "Technology",
  "date": "2026-03-15",
  "time": "14:00:00",
  "location": "Convention Center",
  "price": 99.99,
  "status": "Upcoming",
  "description": "Updated event description",
  "imageUrl": "https://example.com/image.jpg"
}
```

#### Delete Event
```
DELETE /api/admin/events/{id}
```
Deletes an event from the system.

### User Management

#### Get All Users
```
GET /api/admin/users
```
Returns a list of all users in the system.

#### Get User by ID
```
GET /api/admin/users/{id}
```
Returns details of a specific user.

#### Delete User
```
DELETE /api/admin/users/{id}
```
Deletes a user from the system.

#### Ban User
```
PUT /api/admin/users/{id}/ban
```
Bans a user from the system.

#### Unban User
```
PUT /api/admin/users/{id}/unban
```
Unbans a previously banned user.

## Running the Service

### Using Docker Compose
```bash
docker-compose up admin-service
```

### Using Maven
```bash
cd backend/admin-service
mvn spring-boot:run
```

### Building with Maven
```bash
mvn clean package
```

## Service Architecture

The Admin Service uses OpenFeign clients to communicate with other microservices:

```
AdminController
    ├── AdminEventService → EventServiceClient → event-service
    ├── AdminUserService → AuthServiceClient → auth-service
    └── AdminAnalyticsService
            ├── EventServiceClient → event-service
            ├── AuthServiceClient → auth-service
            ├── AttendeeServiceClient → attendee-service
            └── TicketServiceClient → ticket-service
```

## Error Handling

The service includes exception handling that returns appropriate HTTP status codes and error messages:
- 400 Bad Request: For validation errors or bad input
- 404 Not Found: When requested resources don't exist
- 500 Internal Server Error: For unexpected errors

## Health Check

The service is automatically registered with Eureka and can be monitored through:
- Eureka Dashboard: http://localhost:8761
- Direct access: http://localhost:8087/actuator/health (if actuator is enabled)

## Notes

- All UUID fields are auto-generated
- The service requires other microservices (event-service, auth-service, etc.) to be running
- Feign client timeout is set to 5000ms
- The service gracefully handles unavailable downstream services in the analytics endpoint

# Profile Service

User profile management service for the Event Management System.

## Features

- **Profile Management**: Create and update user profiles with bio, contact information, and location
- **Avatar Upload**: Upload and manage profile pictures (up to 5MB)
- **User Preferences**: Configure notification settings, language, timezone, and display formats
- **Emergency Contact**: Store emergency contact information for attendees

## API Endpoints

### Profile Operations
- `GET /api/profiles/{userId}` - Get user profile
- `POST /api/profiles/{userId}` - Create new profile
- `PUT /api/profiles/{userId}` - Update profile information
- `POST /api/profiles/{userId}/avatar` - Upload profile avatar

### Preferences
- `GET /api/profiles/{userId}/preferences` - Get user preferences
- `PUT /api/profiles/{userId}/preferences` - Update preferences

### Emergency Contact
- `GET /api/profiles/{userId}/emergency-contact` - Get emergency contact
- `PUT /api/profiles/{userId}/emergency-contact` - Update emergency contact
- `DELETE /api/profiles/{userId}/emergency-contact` - Delete emergency contact

## Configuration

- **Port**: 8088
- **Database**: H2 (file-based storage at `/data/profiledb`)
- **Avatar Storage**: `/data/avatars`
- **Max Upload Size**: 5MB

## Running Locally

```bash
mvn spring-boot:run
```

## Running with Docker

```bash
docker build -t profile-service .
docker run -p 8088:8088 profile-service
```

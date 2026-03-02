package com.eventflow.apigateway.security;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RouteValidator {

    // List of endpoints that don't require authentication
    private static final List<String> OPEN_API_ENDPOINTS = List.of(
            "/api/auth", // All auth endpoints (login, register)
            "/api/events/health", // Health check
            "/api/attendees/health", // Health check
            "/api/tickets/health", // Health check
            "/api/notifications/health", // Health check
            "/api/analytics/health", // Health check
            "/api/admin/health", // Health check
            "/actuator", // Actuator endpoints
            "/swagger-ui", // Swagger UI
            "/v3/api-docs", // OpenAPI documentation
            "/swagger-ui.html", // Swagger UI HTML
            "/webjars/swagger-ui" // Swagger UI resources
    );

    // Endpoints that use GET method and don't require auth (public viewing)
    private static final List<String> OPEN_GET_ENDPOINTS = List.of(
            "/api/events", // Viewing events list (GET only)
            "/api/attendees", // Viewing attendees list (GET only)
            "/api/tickets", // Viewing tickets list (GET only)
            "/api/analytics" // Viewing analytics data (GET only)
    );

    public boolean isOpenEndpoint(ServerHttpRequest request) {
        String path = request.getPath().toString();
        String method = request.getMethod().name();

        // Check if it's an open API endpoint
        for (String openEndpoint : OPEN_API_ENDPOINTS) {
            if (path.startsWith(openEndpoint)) {
                return true;
            }
        }

        // Check if it's a GET request to an open GET endpoint
        if ("GET".equalsIgnoreCase(method)) {
            for (String openGetEndpoint : OPEN_GET_ENDPOINTS) {
                if (path.startsWith(openGetEndpoint)) {
                    return true;
                }
            }
        }

        return false;
    }
}

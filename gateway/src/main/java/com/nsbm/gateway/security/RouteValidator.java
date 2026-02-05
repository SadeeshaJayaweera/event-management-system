package com.nsbm.gateway.security;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RouteValidator {

    // List of endpoints that don't require authentication
    private static final List<String> OPEN_API_ENDPOINTS = List.of(
            "/api/users/auth", // All auth endpoints (login, register, google)
            "/api/users/health", // Health check
            "/api/events/health", // Health check
            "/api/events/published", // Public events (no auth required to view)
            "/api/events/upcoming", // Public upcoming events
            "/api/events/featured", // Public featured events
            "/api/events/category", // Public category browsing
            "/api/events/search", // Public search
            "/actuator" // Actuator endpoints
    );

    // Endpoints that use GET method and don't require auth
    private static final List<String> OPEN_GET_ENDPOINTS = List.of(
            "/api/events" // Viewing events list (GET only)
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

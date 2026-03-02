package com.eventflow.authservice.service;

import com.eventflow.authservice.client.NotificationServiceClient;
import com.eventflow.authservice.dto.AuthResponse;
import com.eventflow.authservice.dto.LoginRequest;
import com.eventflow.authservice.dto.RegisterRequest;
import com.eventflow.authservice.model.User;
import com.eventflow.authservice.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final NotificationServiceClient notificationClient;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
  
  @Value("${jwt.secret:bXlTZWNyZXRLZXkxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ=}")
  private String secretKey;
  
  @Value("${jwt.expiration:86400000}") // 24 hours in milliseconds
  private long jwtExpiration;

  public AuthService(UserRepository userRepository, NotificationServiceClient notificationClient) {
    this.userRepository = userRepository;
    this.notificationClient = notificationClient;
  }

  public AuthResponse register(RegisterRequest request) {
    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
      throw new IllegalArgumentException("Email already registered");
    }

    User user = new User();
    user.setName(request.getName());
    user.setEmail(request.getEmail());
    user.setRole(request.getRole());
    user.setPasswordHash(encoder.encode(request.getPassword()));
    user.setStatus("active");

    
    User saved = userRepository.save(user);
    
    // Send notifications to all admins
    try {
      List<User> admins = userRepository.findByRole("admin");
      for (User admin : admins) {
        notificationClient.sendInAppNotification(
          admin.getId(),
          "NEW_USER_REGISTERED",
          "New user registered: " + saved.getName(),
          "/admin/users/" + saved.getId()
        );
      }
    } catch (Exception e) {
      System.err.println("Failed to send user registration notifications: " + e.getMessage());
    }
    
    return new AuthResponse(saved.getId(), saved.getName(), saved.getRole(), issueToken(saved));
  }

  public AuthResponse login(LoginRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
      .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

    if (!encoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new IllegalArgumentException("Invalid credentials");
    }

    if ("banned".equals(user.getStatus())) {
      throw new IllegalArgumentException("Your account has been banned. Please contact support.");
    }

    return new AuthResponse(user.getId(), user.getName(), user.getRole(), issueToken(user));
  }

  public List<User> getUsersByRole(String role) {
    if (role != null && !role.isEmpty()) {
      return userRepository.findByRole(role);
    }
    return userRepository.findAll();
  }

  private String issueToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", user.getId().toString()); // Convert UUID to String
    claims.put("role", user.getRole());
    
    Date now = new Date();
    Date expiration = new Date(now.getTime() + jwtExpiration);
    
    return Jwts.builder()
            .claims(claims)
            .subject(user.getEmail())
            .issuedAt(now)
            .expiration(expiration)
            .signWith(getSignInKey())
            .compact();
  }
  
  private SecretKey getSignInKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    return Keys.hmacShaKeyFor(keyBytes);
  }
}


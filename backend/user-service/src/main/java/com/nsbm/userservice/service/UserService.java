package com.nsbm.userservice.service;

import com.nsbm.userservice.dto.*;
import com.nsbm.userservice.exception.DuplicateResourceException;
import com.nsbm.userservice.exception.ResourceNotFoundException;
import com.nsbm.userservice.model.Role;
import com.nsbm.userservice.model.User;
import com.nsbm.userservice.repository.UserRepository;
import com.nsbm.userservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    // ==================== Authentication Methods ====================

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.USER)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        // Create user DTO
        UserDTO userDTO = toDTO(user);

        // Generate JWT token
        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .user(userDTO)
                .message("User registered successfully")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Verify password using BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalStateException("Invalid credentials");
        }

        if (!user.getEnabled()) {
            throw new IllegalStateException("Account is disabled");
        }

        // Create user DTO
        UserDTO userDTO = toDTO(user);

        // Generate JWT token
        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .user(userDTO)
                .message("Login successful")
                .build();
    }

    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        try {
            // Use Access Token to get User Info
            Map<String, Object> payload = getGoogleUserInfo(request.getToken());

            String email = (String) payload.get("email");

            // Check if user exists
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // Determine if this is a login attempt without prior registration
                throw new IllegalStateException("User not registered. Please sign up with Google first.");
            }

            // Return Auth Response
            UserDTO userDTO = toDTO(user);
            return buildAuthResponse(user, userDTO, "Google Login successful");

        } catch (Exception e) {
            throw new IllegalStateException("Google Auth failed: " + e.getMessage());
        }
    }

    public AuthResponse registerWithGoogle(GoogleLoginRequest request) {
        try {
            // Use Access Token to get User Info
            Map<String, Object> payload = getGoogleUserInfo(request.getToken());

            String email = (String) payload.get("email");
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");

            // Check if user exists
            User user = userRepository.findByEmail(email).orElse(null);

            if (user != null) {
                // User already exists, perhaps log them in or throw error
                // The requirement is "signup using google". If already exists, we can treat it
                // as success or "already registered"
                // Let's return success (idempotent)
                UserDTO userDTO = toDTO(user);
                return buildAuthResponse(user, userDTO, "User already registered. Login successful.");
            }

            // Determine Role
            Role userRole = Role.USER;
            if (request.getRole() != null) {
                try {
                    userRole = Role.valueOf(request.getRole().toUpperCase());
                } catch (IllegalArgumentException e) {
                    // Invalid role, keep default
                }
            }

            // Register new user with a secure placeholder password
            user = User.builder()
                    .email(email)
                    .firstName(firstName != null ? firstName : "Google")
                    .lastName(lastName != null ? lastName : "User")
                    .password(passwordEncoder.encode("GOOGLE_OAUTH_" + System.currentTimeMillis()))
                    .role(userRole)
                    .enabled(true)
                    .build();
            user = userRepository.save(user);

            // Return Auth Response
            UserDTO userDTO = toDTO(user);
            return buildAuthResponse(user, userDTO, "Google Registration successful");

        } catch (Exception e) {
            throw new IllegalStateException("Google Registration failed: " + e.getMessage());
        }
    }

    private Map<String, Object> getGoogleUserInfo(String token) {
        RestTemplate restTemplate = new RestTemplate();
        String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<String> entity = new HttpEntity<>("", headers);

        ResponseEntity<Map> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody();
        } else {
            throw new IllegalStateException("Invalid Access Token or failed to fetch user info.");
        }
    }

    private AuthResponse buildAuthResponse(User user, UserDTO userDTO, String message) {
        // Generate real JWT token
        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .user(userDTO)
                .message(message)
                .build();
    }

    // ==================== CRUD Methods ====================

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return toDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return toDTO(user);
    }

    public UserDTO updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("User", "email", request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        user = userRepository.save(user);
        return toDTO(user);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
    }

    // ==================== Role and Status Management ====================

    public UserDTO updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setRole(role);
        user = userRepository.save(user);
        return toDTO(user);
    }

    public void disableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setEnabled(false);
        userRepository.save(user);
    }

    public void enableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setEnabled(true);
        userRepository.save(user);
    }

    // ==================== Search Methods ====================

    @Transactional(readOnly = true)
    public List<UserDTO> searchUsers(String query) {
        return userRepository.searchUsers(query).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ==================== Utility Methods ====================

    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

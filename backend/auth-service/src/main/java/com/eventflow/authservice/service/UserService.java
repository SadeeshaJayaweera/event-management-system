package com.eventflow.authservice.service;

import com.eventflow.authservice.dto.UserResponse;
import com.eventflow.authservice.model.User;
import com.eventflow.authservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {
  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public List<UserResponse> getAllUsers() {
    return userRepository.findAll().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public UserResponse getUser(UUID id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
    return toResponse(user);
  }

  public void deleteUser(UUID id) {
    if (!userRepository.existsById(id)) {
      throw new IllegalArgumentException("User not found");
    }
    userRepository.deleteById(id);
  }

  public void banUser(UUID id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
    user.setStatus("banned");
    userRepository.save(user);
  }

  public void unbanUser(UUID id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
    user.setStatus("active");
    userRepository.save(user);
  }

  private UserResponse toResponse(User user) {
    return new UserResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        user.getStatus()
    );
  }
}

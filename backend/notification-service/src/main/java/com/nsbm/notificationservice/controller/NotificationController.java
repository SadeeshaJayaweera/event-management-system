package com.nsbm.notificationservice.controller;

import com.nsbm.notificationservice.dto.NotificationRequest;
import com.nsbm.notificationservice.entity.NotificationLog;
import com.nsbm.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @PostMapping("/send")
    public ResponseEntity<String> sendNotification(@RequestBody NotificationRequest request) {
        log.info("Sending notification to {}: {}", request.getRecipient(), request.getMessage());

        // Mock sending logic (e.g. EmailService.send(...))

        NotificationLog notificationLog = NotificationLog.builder()
                .recipient(request.getRecipient())
                .message(request.getMessage())
                .type(request.getType())
                .sentAt(LocalDateTime.now())
                .status("SENT")
                .build();

        notificationRepository.save(notificationLog);

        return ResponseEntity.ok("Notification sent successfully");
    }
}

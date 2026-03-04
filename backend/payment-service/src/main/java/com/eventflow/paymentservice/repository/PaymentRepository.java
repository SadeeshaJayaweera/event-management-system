package com.eventflow.paymentservice.repository;

import com.eventflow.paymentservice.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByOrderId(String orderId);

    List<Payment> findByEventId(UUID eventId);

    List<Payment> findByEventIdAndStatus(UUID eventId, String status);

    List<Payment> findByUserId(UUID userId);

    List<Payment> findByStatusIn(java.util.List<String> statuses);
}

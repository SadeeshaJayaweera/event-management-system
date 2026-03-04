package com.eventflow.paymentservice.service;

import com.eventflow.paymentservice.dto.PaymentInitRequest;
import com.eventflow.paymentservice.dto.PaymentInitResponse;
import com.eventflow.paymentservice.dto.PaymentNotifyRequest;
import com.eventflow.paymentservice.model.Payment;
import com.eventflow.paymentservice.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.RoundingMode;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    @Value("${payhere.merchant-id}")
    private String merchantId;

    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Value("${payhere.return-url}")
    private String returnUrl;

    @Value("${payhere.cancel-url}")
    private String cancelUrl;

    @Value("${payhere.notify-url}")
    private String notifyUrl;

    @Value("${payhere.sandbox:true}")
    private boolean sandbox;

    @Value("${ticket-service.url}")
    private String ticketServiceUrl;

    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
        this.restTemplate = new RestTemplate();
    }

    public PaymentInitResponse initPayment(PaymentInitRequest request) {
        // Generate unique order ID
        String orderId = "EF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Format amount to 2 decimal places
        String amountStr = request.getAmount().setScale(2, RoundingMode.HALF_UP).toPlainString();

        // Generate PayHere hash: MD5(merchant_id + order_id + amount + currency +
        // MD5(merchant_secret)_uppercase)
        String hash = generateHash(orderId, amountStr, "LKR");

        // Save pending payment
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setEventId(request.getEventId());
        payment.setUserId(request.getUserId());
        payment.setAmount(request.getAmount());
        payment.setCurrency("LKR");
        payment.setStatus("PENDING");
        payment.setFirstName(request.getFirstName());
        payment.setLastName(request.getLastName());
        payment.setEmail(request.getEmail());
        payment.setPhone(request.getPhone());
        payment.setEventTitle(request.getEventTitle() != null ? request.getEventTitle() : "Event Ticket");
        payment.setCreatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // Build response
        PaymentInitResponse resp = new PaymentInitResponse();
        resp.setOrderId(orderId);
        resp.setMerchantId(merchantId);
        resp.setHash(hash);
        resp.setAmount(amountStr);
        resp.setCurrency("LKR");
        resp.setItemName(payment.getEventTitle());
        resp.setReturnUrl(returnUrl + "?orderId=" + orderId);
        resp.setCancelUrl(cancelUrl);
        resp.setNotifyUrl(notifyUrl);
        resp.setFirstName(request.getFirstName());
        resp.setLastName(request.getLastName());
        resp.setEmail(request.getEmail());
        resp.setPhone(request.getPhone());
        resp.setSandbox(sandbox);
        return resp;
    }

    public void handleNotification(PaymentNotifyRequest notify) {
        log.info("PayHere notification received: order={}, status={}, payment={}",
                notify.getOrder_id(), notify.getStatus_code(), notify.getPayment_id());

        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(notify.getOrder_id());
        if (paymentOpt.isEmpty()) {
            log.warn("Payment not found for orderId: {}", notify.getOrder_id());
            return;
        }

        Payment payment = paymentOpt.get();

        // Validate MD5 signature
        if (!validateNotifyHash(notify, payment.getAmount().setScale(2, RoundingMode.HALF_UP).toPlainString())) {
            log.warn("Invalid MD5 signature for order: {}", notify.getOrder_id());
            return;
        }

        // 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = chargedback
        String status;
        switch (notify.getStatus_code()) {
            case "2" -> status = "COMPLETED";
            case "0" -> status = "PENDING";
            case "-1" -> status = "CANCELLED";
            case "-2" -> status = "FAILED";
            default -> status = "UNKNOWN";
        }

        payment.setStatus(status);
        payment.setPaymentId(notify.getPayment_id());
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // If payment succeeded, create ticket via ticket-service
        if ("COMPLETED".equals(status)) {
            createTicket(payment);
        }
    }

    public Payment getByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for orderId: " + orderId));
    }

    public List<Payment> getByEventId(UUID eventId) {
        return paymentRepository.findByEventId(eventId);
    }

    public List<Payment> getByUserId(UUID userId) {
        return paymentRepository.findByUserId(userId);
    }

    public void refundPayment(String orderId, java.util.Map<String, String> bankDetails) {
        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(orderId);
        if (paymentOpt.isEmpty()) {
            throw new IllegalArgumentException("Payment not found for orderId: " + orderId);
        }
        Payment payment = paymentOpt.get();
        payment.setStatus("REFUNDED");
        payment.setUpdatedAt(LocalDateTime.now());
        if (bankDetails != null) {
            if (bankDetails.get("bankName") != null)
                payment.setBankName(bankDetails.get("bankName"));
            if (bankDetails.get("bankBranch") != null)
                payment.setBankBranch(bankDetails.get("bankBranch"));
            if (bankDetails.get("bankAccountName") != null)
                payment.setBankAccountName(bankDetails.get("bankAccountName"));
            if (bankDetails.get("bankAccountNumber") != null)
                payment.setBankAccountNumber(bankDetails.get("bankAccountNumber"));
        }
        paymentRepository.save(payment);
        log.info("Payment refunded for order {}", orderId);
    }

    public List<Payment> getRefunds() {
        return paymentRepository.findByStatusIn(java.util.List.of("REFUNDED", "REFUND_DONE"));
    }

    public void markRefundDone(String orderId) {
        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(orderId);
        if (paymentOpt.isEmpty()) {
            throw new IllegalArgumentException("Payment not found for orderId: " + orderId);
        }
        Payment payment = paymentOpt.get();
        payment.setStatus("REFUND_DONE");
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        log.info("Refund marked as done for order {}", orderId);
    }

    public void simulateNotificationForDev(String orderId) {
        if (!sandbox)
            return; // Only allow in sandbox mode
        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(orderId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            if ("PENDING".equals(payment.getStatus())) {
                payment.setStatus("COMPLETED");
                payment.setPaymentId("DEV-" + UUID.randomUUID().toString().substring(0, 8));
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);
                createTicket(payment);
                log.info("Simulated PayHere webhook for order {}", orderId);
            }
        }
    }

    private void createTicket(Payment payment) {
        try {
            Map<String, Object> ticketRequest = new HashMap<>();
            ticketRequest.put("eventId", payment.getEventId().toString());
            ticketRequest.put("attendeeId", payment.getUserId().toString());
            ticketRequest.put("price", payment.getAmount());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(ticketRequest, headers);

            ResponseEntity<?> response = restTemplate.postForEntity(
                    ticketServiceUrl + "/api/tickets", entity, Map.class);
            log.info("Ticket created successfully: {}", response.getBody());
        } catch (Exception e) {
            log.error("Failed to create ticket for payment {}: {}", payment.getOrderId(), e.getMessage());
        }
    }

    private String generateHash(String orderId, String amount, String currency) {
        try {
            // Step 1: MD5 of merchant secret (uppercase)
            String secretMd5 = md5(merchantSecret).toUpperCase();
            // Step 2: MD5 of concatenation
            String raw = merchantId + orderId + amount + currency + secretMd5;
            return md5(raw).toUpperCase();
        } catch (Exception e) {
            throw new RuntimeException("Hash generation failed", e);
        }
    }

    private boolean validateNotifyHash(PaymentNotifyRequest notify, String amount) {
        try {
            String secretMd5 = md5(merchantSecret).toUpperCase();
            String raw = notify.getMerchant_id()
                    + notify.getOrder_id()
                    + notify.getPayment_id()
                    + amount
                    + notify.getPayhere_currency()
                    + notify.getStatus_code()
                    + secretMd5;
            String expected = md5(raw).toUpperCase();
            return expected.equals(notify.getMd5sig());
        } catch (Exception e) {
            log.error("Hash validation error", e);
            return false;
        }
    }

    private String md5(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hash = md.digest(input.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}

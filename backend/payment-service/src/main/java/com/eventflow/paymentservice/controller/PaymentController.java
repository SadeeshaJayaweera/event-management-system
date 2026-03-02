package com.eventflow.paymentservice.controller;

import com.eventflow.paymentservice.dto.PaymentInitRequest;
import com.eventflow.paymentservice.dto.PaymentInitResponse;
import com.eventflow.paymentservice.dto.PaymentNotifyRequest;
import com.eventflow.paymentservice.dto.PaymentResponse;
import com.eventflow.paymentservice.model.Payment;
import com.eventflow.paymentservice.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Initiates a PayHere payment session.
     * Returns all fields required to build the PayHere checkout form.
     */
    @PostMapping("/init")
    public ResponseEntity<PaymentInitResponse> initPayment(
            @Valid @RequestBody PaymentInitRequest request) {
        PaymentInitResponse response = paymentService.initPayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * PayHere server-to-server notification endpoint.
     * Called by PayHere sandbox after a payment attempt.
     * Must return HTTP 200.
     */
    @PostMapping("/notify")
    public ResponseEntity<Void> notify(@ModelAttribute PaymentNotifyRequest notify) {
        paymentService.handleNotification(notify);
        return ResponseEntity.ok().build();
    }

    /**
     * Poll payment status by orderId.
     * Used by the frontend success page to confirm payment completion.
     */
    @GetMapping("/status/{orderId}")
    public ResponseEntity<PaymentResponse> getStatus(@PathVariable String orderId) {
        Payment payment = paymentService.getByOrderId(orderId);
        return ResponseEntity.ok(toResponse(payment));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @PostMapping("/dev/force-complete/{orderId}")
    public ResponseEntity<Void> forceCompleteLocal(@PathVariable String orderId) {
        paymentService.simulateNotificationForDev(orderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<java.util.List<PaymentResponse>> getByEventId(@PathVariable java.util.UUID eventId) {
        return ResponseEntity.ok(
                paymentService.getByEventId(eventId).stream().map(this::toResponse).toList());
    }

    @PostMapping("/refund/{orderId}")
    public ResponseEntity<Void> refundPayment(@PathVariable String orderId) {
        paymentService.refundPayment(orderId);
        return ResponseEntity.ok().build();
    }

    private PaymentResponse toResponse(Payment payment) {
        PaymentResponse resp = new PaymentResponse();
        resp.setId(payment.getId());
        resp.setOrderId(payment.getOrderId());
        resp.setEventId(payment.getEventId());
        resp.setUserId(payment.getUserId());
        resp.setAmount(payment.getAmount());
        resp.setCurrency(payment.getCurrency());
        resp.setStatus(payment.getStatus());
        resp.setPaymentId(payment.getPaymentId());
        resp.setFirstName(payment.getFirstName());
        resp.setLastName(payment.getLastName());
        resp.setEmail(payment.getEmail());
        resp.setEventTitle(payment.getEventTitle());
        resp.setCreatedAt(payment.getCreatedAt());
        resp.setUpdatedAt(payment.getUpdatedAt());
        return resp;
    }
}

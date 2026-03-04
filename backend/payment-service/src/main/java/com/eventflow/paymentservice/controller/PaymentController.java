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
    public ResponseEntity<Void> refundPayment(
            @PathVariable String orderId,
            @RequestBody(required = false) java.util.Map<String, String> bankDetails) {
        paymentService.refundPayment(orderId, bankDetails);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/refunds")
    public ResponseEntity<java.util.List<PaymentResponse>> getRefunds() {
        return ResponseEntity.ok(
                paymentService.getRefunds().stream().map(this::toResponse).toList());
    }

    @PostMapping("/refund-done/{orderId}")
    public ResponseEntity<Void> markRefundDone(@PathVariable String orderId) {
        paymentService.markRefundDone(orderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<java.util.List<PaymentResponse>> getByUserId(@PathVariable java.util.UUID userId) {
        return ResponseEntity.ok(
                paymentService.getByUserId(userId).stream().map(this::toResponse).toList());
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
        resp.setBankName(payment.getBankName());
        resp.setBankBranch(payment.getBankBranch());
        resp.setBankAccountName(payment.getBankAccountName());
        resp.setBankAccountNumber(payment.getBankAccountNumber());
        resp.setCreatedAt(payment.getCreatedAt());
        resp.setUpdatedAt(payment.getUpdatedAt());
        return resp;
    }
}

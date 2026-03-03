package com.eventflow.paymentservice.controller;

import com.eventflow.paymentservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<Map<String, String>> initiatePayment(@RequestBody Map<String, Object> request) {
        String orderId = (String) request.get("orderId");
        Double amount = Double.valueOf(String.valueOf(request.get("amount")));
        String currency = (String) request.get("currency");

        String hash = paymentService.generateHash(orderId, amount, currency);

        Map<String, String> response = new HashMap<>();
        response.put("merchant_id", paymentService.getMerchantId());
        response.put("order_id", orderId);
        String formattedAmount = new java.text.DecimalFormat("0.00").format(amount);
        response.put("amount", formattedAmount);
        response.put("currency", currency);
        response.put("hash", hash);
        response.put("action_url", "https://sandbox.payhere.lk/pay/checkout");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "payment-service");
        return ResponseEntity.ok(response);
    }
}

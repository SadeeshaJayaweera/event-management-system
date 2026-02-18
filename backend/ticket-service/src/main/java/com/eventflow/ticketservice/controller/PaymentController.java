package com.eventflow.ticketservice.controller;

import com.eventflow.ticketservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets/payment")
@CrossOrigin(origins = "*") // Allow frontend access
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
        response.put("amount", String.valueOf(amount));
        response.put("currency", currency);
        response.put("hash", hash);
        // Add sandbox URL if needed by frontend, or frontend can hardcode it
        response.put("action_url", "https://sandbox.payhere.lk/pay/checkout");

        return ResponseEntity.ok(response);
    }
}

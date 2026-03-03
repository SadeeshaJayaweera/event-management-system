package com.eventflow.paymentservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;

@Service
public class PaymentService {

    @Value("${payhere.merchant-id}")
    private String merchantId;

    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Value("${payhere.mode:sandbox}")
    private String mode;

    public String generateHash(String orderId, double amount, String currency) {
        String formattedAmount = new DecimalFormat("0.00").format(amount);
        String toHash = merchantId + orderId + formattedAmount + currency + getMd5(merchantSecret).toUpperCase();
        return getMd5(toHash).toUpperCase();
    }

    public String getMerchantId() {
        return merchantId;
    }

    public String getMode() {
        return mode;
    }

    private String getMd5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : messageDigest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm not found", e);
        }
    }
}

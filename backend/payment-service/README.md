# Payment Service

A microservice for handling payment gateway integration with PayHere.

## Overview

The Payment Service is responsible for generating secure payment hashes and managing payment initiation requests for the EventFlow system. It integrates with PayHere payment gateway to process ticket purchases securely.

## Features

- **Payment Initiation**: Generate secure payment hashes for PayHere transactions
- **PayHere Integration**: Sandbox and production mode support
- **Microservice Architecture**: Registered with Eureka service discovery
- **API Documentation**: Swagger/OpenAPI documentation available

## Configuration

The service is configured via `application.yml`:

- **Port**: 8083
- **Service Name**: payment-service
- **PayHere Merchant ID**: Configurable for sandbox/production
- **PayHere Merchant Secret**: Encrypted secret for hash generation

## API Endpoints

### POST /api/payment/initiate
Initiates a payment by generating a secure hash for PayHere gateway.

**Request Body:**
```json
{
  "orderId": "ORDER-123456789",
  "amount": 100.00,
  "currency": "LKR"
}
```

**Response:**
```json
{
  "merchant_id": "1234081",
  "order_id": "ORDER-123456789",
  "amount": "100.00",
  "currency": "LKR",
  "hash": "GENERATED_MD5_HASH",
  "action_url": "https://sandbox.payhere.lk/pay/checkout"
}
```

### GET /api/payment/health
Health check endpoint for monitoring service availability.

## Security

- Payment hash generation uses MD5 algorithm with merchant secret
- All requests are routed through the API Gateway
- Payment endpoints are configured as public in the gateway for checkout flow

## Technologies

- Spring Boot 3.2.5
- Spring Cloud Netflix Eureka Client
- Java 17
- Maven

## Running Locally

```bash
mvn clean install
mvn spring-boot:run
```

## Docker

```bash
docker build -t payment-service .
docker run -p 8083:8083 payment-service
```

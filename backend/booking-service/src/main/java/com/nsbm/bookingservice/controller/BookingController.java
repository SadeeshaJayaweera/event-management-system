package com.nsbm.bookingservice.controller;

import com.nsbm.bookingservice.dto.BookingDTO;
import com.nsbm.bookingservice.dto.CreateBookingRequest;
import com.nsbm.bookingservice.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ==================== CRUD Endpoints ====================

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        BookingDTO booking = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        BookingDTO booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/reference/{reference}")
    public ResponseEntity<BookingDTO> getBookingByReference(@PathVariable String reference) {
        BookingDTO booking = bookingService.getBookingByReference(reference);
        return ResponseEntity.ok(booking);
    }

    @GetMapping
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        List<BookingDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Query Endpoints ====================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByUser(@PathVariable Long userId) {
        List<BookingDTO> bookings = bookingService.getBookingsByUser(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByEvent(@PathVariable Long eventId) {
        List<BookingDTO> bookings = bookingService.getBookingsByEvent(eventId);
        return ResponseEntity.ok(bookings);
    }

    // ==================== Status Management Endpoints ====================

    @PutMapping("/{id}/confirm-payment")
    public ResponseEntity<BookingDTO> confirmPayment(@PathVariable Long id) {
        BookingDTO booking = bookingService.confirmPayment(id);
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable Long id) {
        BookingDTO booking = bookingService.cancelBooking(id);
        return ResponseEntity.ok(booking);
    }

    // ==================== Analytics Endpoints ====================

    @GetMapping("/event/{eventId}/revenue")
    public ResponseEntity<BigDecimal> getEventRevenue(@PathVariable Long eventId) {
        BigDecimal revenue = bookingService.getEventRevenue(eventId);
        return ResponseEntity.ok(revenue);
    }

    @GetMapping("/event/{eventId}/count")
    public ResponseEntity<Long> getEventBookingsCount(@PathVariable Long eventId) {
        Long count = bookingService.getEventBookingsCount(eventId);
        return ResponseEntity.ok(count);
    }

    // ==================== Utility Endpoints ====================

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Booking Service is running");
    }
}

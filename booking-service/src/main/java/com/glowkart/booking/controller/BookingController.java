package com.glowkart.booking.controller;

import com.glowkart.booking.dto.*;
import com.glowkart.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/calculate-price")
    public ResponseEntity<ApiResponse<BookingPriceResponseDTO>> calculatePriceWithPoints(
            @RequestBody BookingPriceRequestDTO request) {
        BookingPriceResponseDTO response = bookingService.calculateFinalAmountWithPoints(request);
        return ResponseEntity.ok(ApiResponse.of(true, "Price calculated successfully", response, 200));
    }

    
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> createBooking(
            @RequestBody BookingRequestDTO request) {
        BookingResponseDTO response = bookingService.createBooking(request);
        return ResponseEntity.ok(ApiResponse.of(true, "Booking created successfully", response, 200));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> cancelBooking(
            @RequestBody CancelBookingDTO request) {
        BookingResponseDTO response = bookingService.cancelBooking(request);
        return ResponseEntity.ok(ApiResponse.of(true, "Booking cancelled successfully", response, 200));
    }

    @PostMapping("/reschedule")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> rescheduleBooking(
            @RequestBody RescheduleBookingDTO request) {
        BookingResponseDTO response = bookingService.rescheduleBooking(request);
        return ResponseEntity.ok(ApiResponse.of(true, "Booking rescheduled successfully", response, 200));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getCustomerBookings(
            @PathVariable String customerId) {
        List<BookingResponseDTO> bookings = bookingService.getCustomerBookings(customerId);
        return ResponseEntity.ok(ApiResponse.of(true, "Customer bookings fetched successfully", bookings, 200));
    }
}

package com.glowkart.clinicadmin.controller;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.BookingResponseDTO;
import com.glowkart.clinicadmin.dto.UpdateBookingStatusDTO;
import com.glowkart.clinicadmin.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clinic-admin")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * Get bookings for a specific clinic
     */
    @GetMapping("/bookings/{clinicId}")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getClinicBookings(
            @PathVariable String clinicId) {

        List<BookingResponseDTO> bookings = bookingService.getBookingsForClinic(clinicId);

        ApiResponse<List<BookingResponseDTO>> response = new ApiResponse<>(
                true,
                "Clinic bookings fetched successfully",
                bookings,
                200
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Optional: Get bookings for a specific customer
     */
    @GetMapping("/customer-bookings/{customerId}")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getCustomerBookings(
            @PathVariable String customerId) {

        List<BookingResponseDTO> bookings = bookingService.getBookingsForCustomer(customerId);

        ApiResponse<List<BookingResponseDTO>> response = new ApiResponse<>(
                true,
                "Customer bookings fetched successfully",
                bookings,
                200
        );

        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/bookings/update-status")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> updateBookingStatus(
            @RequestBody UpdateBookingStatusDTO request) {

        BookingResponseDTO updatedBooking = bookingService.updateBookingStatus(
                request.getBookingId(), request.getStatus());

        ApiResponse<BookingResponseDTO> response = new ApiResponse<>(
                true,
                "Booking status updated successfully",
                updatedBooking,
                200
        );

        return ResponseEntity.ok(response);
    }


}

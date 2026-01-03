package com.glowkart.clinicadmin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.BookingResponseDTO;
import com.glowkart.clinicadmin.dto.ClinicRatingsResponseDTO;
import com.glowkart.clinicadmin.dto.UpdateBookingStatusDTO;
import com.glowkart.clinicadmin.service.BookingService;

import lombok.RequiredArgsConstructor;

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


    @GetMapping("/ratings/{clinicId}")
    public ResponseEntity<ApiResponse<ClinicRatingsResponseDTO>> getClinicRatings(
            @PathVariable String clinicId) {

        ClinicRatingsResponseDTO data = bookingService.getClinicRatings(clinicId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Clinic ratings fetched successfully",
                        data,
                        200
                )
        );
    }

}

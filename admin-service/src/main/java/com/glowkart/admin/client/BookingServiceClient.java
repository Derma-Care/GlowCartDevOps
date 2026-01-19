package com.glowkart.admin.client;


import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.BookingResponseDTO;
import com.glowkart.admin.dto.ClinicRatingsResponseDTO;
import com.glowkart.admin.dto.UpdateBookingStatusDTO;

@FeignClient(name = "booking-service" , contextId = "bookingServiceClient")
public interface BookingServiceClient {

    // Get bookings for a customer (if you want clinic, booking-service may need to expose /clinic/{clinicId})
    @GetMapping("/booking/customer/{customerId}")
    ApiResponse<List<BookingResponseDTO>> getBookingsByCustomer(@PathVariable("customerId") String customerId);
    
    // If booking-service supports fetching by clinic
    @GetMapping("/booking/clinic/{clinicId}")
    ApiResponse<List<BookingResponseDTO>> getBookingsByClinic(@PathVariable("clinicId") String clinicId);

    // ✅ Add this for updating status
    @PutMapping("/booking/update-status")
    ApiResponse<BookingResponseDTO> updateBookingStatus(@RequestBody UpdateBookingStatusDTO request);

    // ⭐ NEW — get clinic ratings with average
    @GetMapping("/booking/ratings/clinic/{clinicId}")
    ApiResponse<ClinicRatingsResponseDTO> getClinicRatings(
            @PathVariable("clinicId") String clinicId);
}


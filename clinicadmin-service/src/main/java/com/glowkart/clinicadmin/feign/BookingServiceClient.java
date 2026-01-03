package com.glowkart.clinicadmin.feign;

import com.glowkart.clinicadmin.dto.BookingResponseDTO;
import com.glowkart.clinicadmin.dto.ClinicRatingsResponseDTO;
import com.glowkart.clinicadmin.dto.UpdateBookingStatusDTO;
import com.glowkart.clinicadmin.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "booking-service")
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

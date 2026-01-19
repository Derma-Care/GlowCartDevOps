package com.glowkart.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ClinicRatingsResponseDTO;

@FeignClient(name = "booking-service" , contextId = "bookingRatingClient")
public interface BookingRatingClient {

    @GetMapping("/booking/ratings/clinic/{clinicId}")
    ApiResponse<ClinicRatingsResponseDTO> getClinicRatings(
            @PathVariable("clinicId") String clinicId);
}

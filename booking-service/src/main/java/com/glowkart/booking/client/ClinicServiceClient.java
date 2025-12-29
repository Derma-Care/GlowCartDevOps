package com.glowkart.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.glowkart.booking.dto.ApiResponse;
import com.glowkart.booking.dto.ClinicDTO;

@FeignClient(name = "admin-service")
public interface ClinicServiceClient {
    @GetMapping("/admin/clinics/get/{clinicId}")
    ApiResponse<ClinicDTO> getClinicById(@PathVariable String clinicId);
}
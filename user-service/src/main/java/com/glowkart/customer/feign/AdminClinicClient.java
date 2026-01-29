package com.glowkart.customer.feign;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.ClinicPublicDTO;
import com.glowkart.customer.dto.ClinicRegistrationDTO;

@FeignClient(name = "admin-service", contextId = "stateClient")
public interface AdminClinicClient {

    @GetMapping("/admin/public/clinics/by-state")
    ApiResponse<List<ClinicPublicDTO>> getClinicsByState(
            @RequestParam String state,
            @RequestParam(required = false) Boolean online // ✅ new optional parameter
    );
    // ✅ New endpoint to fetch all clinics
    @GetMapping("/admin/clinics")
    ApiResponse<List<ClinicPublicDTO>> getAllClinics();


    @GetMapping("/admin/clinics/get/{clinicId}")
    ApiResponse<ClinicPublicDTO> getClinicById(@PathVariable("clinicId") String clinicId);


    
}

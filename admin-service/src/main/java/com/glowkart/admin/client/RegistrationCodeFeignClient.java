package com.glowkart.admin.client;


import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.RegistrationRequestDTO;
import com.glowkart.admin.dto.RegistrationResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "admin-service",url = "http://3.111.202.212:8080")
public interface RegistrationCodeFeignClient {

    // Generate 500 codes & send email
    @PostMapping("/admin/api/registration/generate")
    ApiResponse<String> generateAndSendDefaultEmail();


    // Verify Code
    @PostMapping("/admin/api/registration/verify")
    ApiResponse<RegistrationResponseDTO> verifyCode(
            @RequestBody RegistrationRequestDTO request
    );


    // Mark Code as Used
    @PostMapping("/admin/api/registration/mark-used")
    ApiResponse<RegistrationResponseDTO> markCodeUsed(
            @RequestBody RegistrationRequestDTO request
    );


    // List all codes
    @GetMapping("/admin/api/registration/all")
    ApiResponse<List<RegistrationResponseDTO>> getAllCodes();
}

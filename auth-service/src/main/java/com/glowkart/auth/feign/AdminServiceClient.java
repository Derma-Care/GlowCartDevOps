package com.glowkart.auth.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.glowkart.auth.dto.ApiResponse;
import com.glowkart.auth.dto.RegistrationRequestDTO;
import com.glowkart.auth.dto.RegistrationResponseDTO;

@FeignClient(name = "admin-service", contextId = "registrationClient")
public interface AdminServiceClient {

    @PostMapping("/admin/api/registration/verify")
    ApiResponse<RegistrationResponseDTO> verifyCode(@RequestBody RegistrationRequestDTO request);

    // ---------------- Call to mark a code as used ----------------
    @PostMapping("/admin/api/registration/mark-used")
    ApiResponse<RegistrationResponseDTO> markCodeUsed(@RequestBody RegistrationRequestDTO request);
}

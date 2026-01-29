package com.glowkart.customer.feign;

import com.glowkart.customer.dto.RegistrationRequestDTO;
import com.glowkart.customer.dto.RegistrationResponseDTO;
import com.glowkart.customer.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "admin-service", contextId = "registrationClient")
public interface AdminServiceClient {

    @PostMapping("/admin/api/registration/verify")
    ApiResponse<RegistrationResponseDTO> verifyCode(@RequestBody RegistrationRequestDTO request);

    // ---------------- Call to mark a code as used ----------------
    @PostMapping("/admin/api/registration/mark-used")
    ApiResponse<RegistrationResponseDTO> markCodeUsed(@RequestBody RegistrationRequestDTO request);
}

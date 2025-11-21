package com.glowkart.customer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glowkart.customer.dto.RegistrationRequestDTO;
import com.glowkart.customer.dto.RegistrationResponseDTO;
import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.feign.AdminServiceClient;
import feign.FeignException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RegistrationService {

    @Autowired
    private AdminServiceClient adminServiceClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ApiResponse<RegistrationResponseDTO> verifyCode(String code) {
        RegistrationRequestDTO request = new RegistrationRequestDTO(code);

        try {
            // Normal successful call (HTTP 200)
            return adminServiceClient.verifyCode(request);
        } catch (FeignException ex) {
            // If Admin Service returns 4xx or 5xx
            String body = ex.contentUTF8();
            try {
                // Deserialize the Admin Service response dynamically
                return objectMapper.readValue(body, new TypeReference<ApiResponse<RegistrationResponseDTO>>() {});
            } catch (Exception e) {
                // Fallback if deserialization fails
                return new ApiResponse<>(false, "Failed to verify code", new RegistrationResponseDTO(code, false, false));
            }
        }
    }
}

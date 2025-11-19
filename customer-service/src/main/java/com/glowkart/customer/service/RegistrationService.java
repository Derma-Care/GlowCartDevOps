package com.glowkart.customer.service;

import com.glowkart.customer.dto.RegistrationRequestDTO;
import com.glowkart.customer.dto.RegistrationResponseDTO;
import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.feign.AdminServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RegistrationService {

    @Autowired
    private AdminServiceClient adminServiceClient;

    public RegistrationResponseDTO verifyCode(String code) {
        RegistrationRequestDTO request = new RegistrationRequestDTO(code);
        ApiResponse<RegistrationResponseDTO> response = adminServiceClient.verifyCode(request);
        return response.getData();
    }
}

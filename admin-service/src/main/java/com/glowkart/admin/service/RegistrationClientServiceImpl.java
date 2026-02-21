package com.glowkart.admin.service;


import com.glowkart.admin.client.RegistrationCodeFeignClient;
import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.RegistrationRequestDTO;
import com.glowkart.admin.dto.RegistrationResponseDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistrationClientServiceImpl implements RegistrationClientService {

    @Autowired
    private RegistrationCodeFeignClient feignClient;

    @Override
    public ApiResponse<String> generateCodes() {
        return feignClient.generateAndSendDefaultEmail();
    }

    @Override
    public ApiResponse<RegistrationResponseDTO> verifyCode(RegistrationRequestDTO request) {
        return feignClient.verifyCode(request);
    }

    @Override
    public ApiResponse<RegistrationResponseDTO> markCodeUsed(RegistrationRequestDTO request) {
        return feignClient.markCodeUsed(request);
    }

    @Override
    public ApiResponse<List<RegistrationResponseDTO>> getAllCodes() {
        return feignClient.getAllCodes();
    }
}


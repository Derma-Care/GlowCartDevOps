package com.glowkart.admin.service;


import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.RegistrationRequestDTO;
import com.glowkart.admin.dto.RegistrationResponseDTO;

import java.util.List;

public interface RegistrationClientService {

    ApiResponse<String> generateCodes();

    ApiResponse<RegistrationResponseDTO> verifyCode(RegistrationRequestDTO request);

    ApiResponse<RegistrationResponseDTO> markCodeUsed(RegistrationRequestDTO request);

    ApiResponse<List<RegistrationResponseDTO>> getAllCodes();
}


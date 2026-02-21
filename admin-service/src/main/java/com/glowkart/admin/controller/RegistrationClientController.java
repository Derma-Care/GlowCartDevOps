package com.glowkart.admin.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.RegistrationRequestDTO;
import com.glowkart.admin.dto.RegistrationResponseDTO;
import com.glowkart.admin.service.RegistrationClientService;

@RestController
@RequestMapping("/admin")
public class RegistrationClientController {

    @Autowired
    private RegistrationClientService service;

    // Generate 500 codes
    @PostMapping("/registration/generate")
    public ApiResponse<String> generateCodes() {
        return service.generateCodes();
    }

    // Verify Code
    @PostMapping("/registration/verify")
    public ApiResponse<RegistrationResponseDTO> verifyCode(
            @RequestBody RegistrationRequestDTO request) {
        return service.verifyCode(request);
    }

    // Mark Code as Used
    @PostMapping("/registration/mark-used")
    public ApiResponse<RegistrationResponseDTO> markCodeUsed(
            @RequestBody RegistrationRequestDTO request) {
        return service.markCodeUsed(request);
    }

    // Get All Codes
    @GetMapping("/registration/all")
    public ApiResponse<List<RegistrationResponseDTO>> getAllCodes() {
        return service.getAllCodes();
    }
}


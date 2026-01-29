package com.glowkart.customer.controller;

import com.glowkart.customer.dto.RegistrationRequestDTO;
import com.glowkart.customer.dto.RegistrationResponseDTO;
import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
//@CrossOrigin("*")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    // Verify registration code
    @PostMapping("/customer/registration/verify")
    public ResponseEntity<ApiResponse<RegistrationResponseDTO>> verify(@RequestBody RegistrationRequestDTO request) {
        return registrationService.verifyCode(request.getCode());
    }

    // Mark registration code as used
    @PostMapping("/customer/registration/mark-used")
    public ResponseEntity<ApiResponse<RegistrationResponseDTO>> markUsed(@RequestBody RegistrationRequestDTO request) {
        return registrationService.markCodeUsed(request.getCode());
    }
}

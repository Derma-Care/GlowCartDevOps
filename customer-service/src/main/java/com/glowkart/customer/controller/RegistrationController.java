package com.glowkart.customer.controller;

import com.glowkart.customer.dto.RegistrationRequestDTO;
import com.glowkart.customer.dto.RegistrationResponseDTO;
import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
// @CrossOrigin("*")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @PostMapping("/customer/registration/verify")
    public ApiResponse<String> verify(@RequestBody RegistrationRequestDTO request) {
        RegistrationResponseDTO response = registrationService.verifyCode(request.getCode());
        String message = response.isValid() ? "Code is valid!" : "Invalid or used code!";
        return new ApiResponse<>(response.isValid(), message, null);
    }
}

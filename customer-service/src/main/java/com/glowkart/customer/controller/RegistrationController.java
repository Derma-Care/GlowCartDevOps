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
// @CrossOrigin("*")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @PostMapping("/customer/registration/verify")
    public ResponseEntity<ApiResponse<RegistrationResponseDTO>> verify(@RequestBody RegistrationRequestDTO request) {
        ApiResponse<RegistrationResponseDTO> response = registrationService.verifyCode(request.getCode());

        // Propagate the correct HTTP status
        if (!response.getData().isValid()) {
            return ResponseEntity.badRequest().body(response); // HTTP 400
        }

        return ResponseEntity.ok(response); // HTTP 200
    }
}

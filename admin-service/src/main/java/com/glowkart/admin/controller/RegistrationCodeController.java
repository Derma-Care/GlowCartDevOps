package com.glowkart.admin.controller;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.RegistrationRequestDTO;
import com.glowkart.admin.dto.RegistrationResponseDTO;
import com.glowkart.admin.model.RegistrationCode;
import com.glowkart.admin.service.RegistrationCodeService;
import com.glowkart.admin.service.RegistrationCodeService.RegistrationResponseDTOWithCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class RegistrationCodeController {

    @Autowired
    private RegistrationCodeService service;

    // Generate 500 codes and email
    @PostMapping("/api/registration/generate")
    public ApiResponse<String> generateAndSendDefaultEmail() {
        List<RegistrationCode> codes = service.generateAndSaveBatch(500);
        String defaultEmail = "ch.saimanikanta92@gmail.com";

        try {
            service.sendCodesByEmail(codes, defaultEmail);
        } catch (Exception e) {
            return new ApiResponse<>(false,
                    "Codes generated but failed to send email: " + e.getMessage(), null);
        }

        return new ApiResponse<>(true,
                "500 registration codes generated and emailed to " + defaultEmail, null);
    }

    // Verify code
    @PostMapping("/api/registration/verify")
    public ResponseEntity<ApiResponse<RegistrationResponseDTO>> verifyCode(
            @RequestBody RegistrationRequestDTO dto) {

        RegistrationResponseDTO result = service.verifyCode(dto);

        if (!result.isValid()) {
            String message = result.isUsed() ? "Code already used!" : "Invalid code!";
            // Return HTTP 400 for business validation error
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, message, result));
        }

        // Return HTTP 200 for successful verification
        return ResponseEntity.ok(new ApiResponse<>(true, "Code verified successfully!", result));
    }

    // Get all codes
    @GetMapping("/api/registration/all")
    public ApiResponse<List<RegistrationResponseDTOWithCode>> getAllCodes() {
        List<RegistrationResponseDTOWithCode> codes = service.getAllCodes();
        return new ApiResponse<>(true, "All registration codes retrieved successfully!", codes);
    }
}

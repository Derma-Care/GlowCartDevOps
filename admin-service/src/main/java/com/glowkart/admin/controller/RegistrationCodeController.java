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
                "500 registration codes generated and emailId to " + defaultEmail, null);
    }

    // ---------------- Verify code ----------------
    @PostMapping("/api/registration/verify")
    public ResponseEntity<ApiResponse<RegistrationResponseDTO>> verifyCode(
            @RequestBody RegistrationRequestDTO dto) {

        RegistrationResponseDTO result = service.verifyCode(dto);

        if (!result.isValid()) {
            // Invalid code
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid code!", result));
        }

        // Code is valid, but check if it is already used
        if (result.isUsed()) {
            return ResponseEntity.ok(
                    new ApiResponse<>(false, "Code already used!", result)
            );
        }

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Code verified successfully!", result)
        );
    }

    // ---------------- Mark code as used ----------------
    @PostMapping("/api/registration/mark-used")
    public ResponseEntity<ApiResponse<RegistrationResponseDTO>> markCodeUsed(
            @RequestBody RegistrationRequestDTO dto) {

        RegistrationResponseDTO result = service.markCodeUsed(dto.getCode());

        if (!result.isValid()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid code!", result));
        }

        // Code is valid, but if already used, mark success=false
        if (result.isUsed()) {
            return ResponseEntity.ok(
                    new ApiResponse<>(false, "Code already used!", result)
            );
        }

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Code marked as used successfully!", result)
        );
    }

    // ---------------- Get all codes ----------------
    @GetMapping("/api/registration/all")
    public ApiResponse<List<RegistrationCodeService.RegistrationResponseDTOWithCode>> getAllCodes() {
        return new ApiResponse<>(true, "All registration codes retrieved successfully!",
                service.getAllCodes());
    }
}

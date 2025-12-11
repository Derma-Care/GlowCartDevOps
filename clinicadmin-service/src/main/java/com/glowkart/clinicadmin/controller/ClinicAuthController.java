package com.glowkart.clinicadmin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ChangePasswordDTO;
import com.glowkart.clinicadmin.dto.ClinicLoginRequest;
import com.glowkart.clinicadmin.dto.ClinicPublicDTO;
import com.glowkart.clinicadmin.dto.ForgotPasswordRequest;
import com.glowkart.clinicadmin.dto.ResetPasswordRequest;
import com.glowkart.clinicadmin.service.ClinicAuthService;

@RestController
@RequestMapping("/clinic-admin")
public class ClinicAuthController {

    private final ClinicAuthService authService;

    public ClinicAuthController(ClinicAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<ClinicPublicDTO>> login(@RequestBody ClinicLoginRequest request) {
        return authService.login(request);
    }
    
    @PutMapping("/updatePassword/{username}")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            @PathVariable String username,
            @RequestBody ChangePasswordDTO dto) {
        return authService.updatePassword(username, dto);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@RequestBody ForgotPasswordRequest request) {
        return authService.resendOtp(request);
    }

}

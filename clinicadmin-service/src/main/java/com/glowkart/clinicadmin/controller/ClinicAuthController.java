package com.glowkart.clinicadmin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.clinicadmin.dto.*;
import com.glowkart.clinicadmin.service.ClinicAuthService;

@RestController
@RequestMapping("/clinic-admin")
public class ClinicAuthController {

    private final ClinicAuthService authService;

    public ClinicAuthController(ClinicAuthService authService) {
        this.authService = authService;
    }

    // ------------------- CLINIC LOGIN / PASSWORD APIs -------------------

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<ClinicPublicDTO>> login(@RequestBody ClinicLoginRequest request) {
        return authService.login(request);
    }

    @PutMapping("/updatePassword/{username}")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            @PathVariable String username,
            @RequestBody ChangePasswordDTO dto
    ) {
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

    // ------------------- PAYOUT LOGIN / PASSWORD APIs -------------------

    @PostMapping("/payout-login")
    public ResponseEntity<ApiResponse<Void>> payoutLogin(@RequestBody PayoutLoginRequest request) {
        return authService.payoutLogin(request);
    }

    @PutMapping("/updatePayoutPassword/{payoutUsername}")
    public ResponseEntity<ApiResponse<Void>> changePayoutPassword(
            @PathVariable String payoutUsername,
            @RequestBody ChangePayoutPasswordDTO dto
    ) {
        return authService.changePayoutPassword(payoutUsername, dto);
    }

    @PostMapping("/payout-forgot-password")
    public ResponseEntity<ApiResponse<Void>> payoutForgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authService.payoutForgotPassword(request);
    }

    @PostMapping("/payout-reset-password")
    public ResponseEntity<ApiResponse<Void>> payoutResetPassword(@RequestBody ResetPasswordRequest request) {
        return authService.payoutResetPassword(request);
    }

    @PostMapping("/payout-resend-otp")
    public ResponseEntity<ApiResponse<Void>> payoutResendOtp(@RequestBody ForgotPasswordRequest request) {
        return authService.payoutResendOtp(request);
    }
}

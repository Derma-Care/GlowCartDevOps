package com.glowkart.clinicadmin.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ChangePasswordDTO;
import com.glowkart.clinicadmin.dto.ChangePayoutPasswordDTO;
import com.glowkart.clinicadmin.dto.ClinicLoginRequest;
import com.glowkart.clinicadmin.dto.ClinicPublicDTO;
import com.glowkart.clinicadmin.dto.ForgotPasswordRequest;
import com.glowkart.clinicadmin.dto.PayoutLoginRequest;
import com.glowkart.clinicadmin.dto.ResetPasswordRequest;


@FeignClient(name = "admin-service")
public interface AdminServiceFeignClient {

    @PostMapping("/admin/clinics/login")
    ResponseEntity<ApiResponse<ClinicPublicDTO>> login(@RequestBody ClinicLoginRequest request);

 // Update Password
    @PutMapping("/admin/clinics/updatePassword/{username}")
    ResponseEntity<ApiResponse<Void>> updatePassword(
            @PathVariable("username") String username,
            @RequestBody ChangePasswordDTO dto
    );

    // Forgot Password (send OTP)
    @PostMapping("/admin/clinics/forgot-password")
    ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody ForgotPasswordRequest request);

    // Reset Password
    @PostMapping("/admin/clinics/reset-password")
    ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody ResetPasswordRequest request);

    // Resend OTP
    @PostMapping("/admin/clinics/resend-otp")
    ResponseEntity<ApiResponse<Void>> resendOtp(@RequestBody ForgotPasswordRequest request);


 // ---------------------------------------------------
    // 15. PAYOUT LOGIN
    // ---------------------------------------------------
    @PostMapping("/admin/clinics/payout-login")
    ResponseEntity<ApiResponse<Void>> payoutLogin(
            @RequestBody PayoutLoginRequest request
    );

    // ---------------------------------------------------
    // 16. CHANGE PAYOUT PASSWORD
    // ---------------------------------------------------
    @PutMapping("/admin/clinics/updatePayoutPassword/{payoutUsername}")
    ResponseEntity<ApiResponse<Void>> changePayoutPassword(
            @PathVariable("payoutUsername") String payoutUsername,
            @RequestBody ChangePayoutPasswordDTO dto
    );

    // ---------------------------------------------------
    // 17. PAYOUT FORGOT PASSWORD (Send OTP)
    // ---------------------------------------------------
    @PostMapping("/admin/clinics/payout-forgot-password")
    ResponseEntity<ApiResponse<Void>> payoutForgotPassword(
            @RequestBody ForgotPasswordRequest request
    );

    // ---------------------------------------------------
    // 18. PAYOUT RESET PASSWORD
    // ---------------------------------------------------
    @PostMapping("/admin/clinics/payout-reset-password")
    ResponseEntity<ApiResponse<Void>> payoutResetPassword(
            @RequestBody ResetPasswordRequest request
    );

    // ---------------------------------------------------
    // 19. PAYOUT RESEND OTP
    // ---------------------------------------------------
    @PostMapping("/admin/clinics/payout-resend-otp")
    ResponseEntity<ApiResponse<Void>> payoutResendOtp(
            @RequestBody ForgotPasswordRequest request
    );
}

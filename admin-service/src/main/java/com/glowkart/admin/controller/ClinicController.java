package com.glowkart.admin.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ChangePasswordDTO;
import com.glowkart.admin.dto.ChangePayoutPasswordDTO;
import com.glowkart.admin.dto.ClinicLoginRequest;
import com.glowkart.admin.dto.ClinicPublicDTO;
import com.glowkart.admin.dto.ClinicRegistrationDTO;
import com.glowkart.admin.dto.ClinicRejectionRequest;
import com.glowkart.admin.dto.ClinicResponse;
import com.glowkart.admin.dto.ForgotPasswordRequest;
import com.glowkart.admin.dto.PayoutLoginRequest;
import com.glowkart.admin.dto.ResetPasswordRequest;
import com.glowkart.admin.model.Clinic;
import com.glowkart.admin.service.ClinicService;
import com.glowkart.admin.util.ClinicMapper;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin")
public class ClinicController {

    private final ClinicService clinicService;

    public ClinicController(ClinicService clinicService) {
        this.clinicService = clinicService;
    }

    // -------------------------------------------
    // 1. REGISTER CLINIC
    // -------------------------------------------
    @PostMapping("/clinics/register")
    public ResponseEntity<ApiResponse<?>> register(@Valid @RequestBody ClinicRegistrationDTO dto) {

        Clinic saved = clinicService.registerClinic(dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Clinic registered successfully",
                        Map.of(
                                "clinicId", saved.getClinicId(),
                                "status", saved.getStatus()
                        ),
                        HttpStatus.CREATED.value()
                ));
    }

    // ---------------------------------------------------
    // 2. START VERIFICATION
    // ---------------------------------------------------
    @PutMapping("/clinics/{clinicId}/start-verification")
    public ResponseEntity<ApiResponse<?>> startVerification(@PathVariable String clinicId) {

        Clinic clinic = clinicService.startVerificationProcess(clinicId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Verification process started successfully",
                        Map.of(
                                "clinicId", clinic.getClinicId(),
                                "status", clinic.getStatus()
                        ),
                        HttpStatus.OK.value()
                )
        );
    }

    // ---------------------------------------------------
    // 3. VERIFY CLINIC
    // ---------------------------------------------------
    @PutMapping("/clinics/{clinicId}/verify")
    public ResponseEntity<ApiResponse<?>> verifyClinic(@PathVariable String clinicId) {

        Clinic clinic = clinicService.verifyClinic(clinicId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Clinic verified successfully",
                        Map.of(
                                "clinicId", clinic.getClinicId(),
                                "status", clinic.getStatus()
                        ),
                        HttpStatus.OK.value()
                )
        );
    }

    // ---------------------------------------------------
    // 4. REJECT CLINIC
    // ---------------------------------------------------
    @PutMapping("/clinics/{clinicId}/reject")
    public ResponseEntity<ApiResponse<?>> rejectClinic(
            @PathVariable String clinicId,
            @Valid @RequestBody ClinicRejectionRequest request) {

        Clinic clinic = clinicService.rejectClinic(clinicId, request.getReason());

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Clinic rejected successfully",
                        Map.of(
                                "clinicId", clinic.getClinicId(),
                                "status", clinic.getStatus(),
                                "reason", request.getReason()
                        ),
                        HttpStatus.OK.value()
                )
        );
    }

    // ---------------------------------------------------
    // 5. GET ALL CLINICS
    // ---------------------------------------------------
    @GetMapping("/clinics")
    public ResponseEntity<ApiResponse<?>> getAll() {

        List<Clinic> clinics = clinicService.getAll();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Fetched clinics successfully",
                        clinics,
                        HttpStatus.OK.value()
                )
        );
    }

    // ---------------------------------------------------
    // 6. GET CLINIC BY ID
    // ---------------------------------------------------
    @GetMapping("/clinics/{clinicId}")
    public ResponseEntity<ApiResponse<ClinicResponse>> getById(@PathVariable String clinicId) {
        Clinic clinic = clinicService.getById(clinicId);
        ClinicResponse response = ClinicMapper.toClinicResponse(clinic);

        return ResponseEntity.ok(
            new ApiResponse<>(true, "Clinic fetched successfully", response, HttpStatus.OK.value())
        );
    }


    // ---------------------------------------------------
    // 7. UPDATE CLINIC
    // ---------------------------------------------------
    @PutMapping("/clinics/{clinicId}")
    public ResponseEntity<ApiResponse<?>> updateClinic(
            @PathVariable String clinicId,
            @RequestBody ClinicRegistrationDTO dto) {

        Clinic updated = clinicService.updateClinic(clinicId, dto);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Clinic updated successfully",
                        updated,
                        HttpStatus.OK.value()
                )
        );
    }

    // ---------------------------------------------------
    // 8. DELETE CLINIC
    // ---------------------------------------------------
    @DeleteMapping("/clinics/{clinicId}")
    public ResponseEntity<ApiResponse<?>> deleteClinic(@PathVariable String clinicId) {

        clinicService.deleteClinic(clinicId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Clinic deleted successfully",
                        null,
                        HttpStatus.OK.value()
                )
        );
    }

    // ---------------------------------------------------
    // 9. GET VERIFIED CLINICS
    // ---------------------------------------------------
    @GetMapping("/clinics/verified")
    public ResponseEntity<ApiResponse<?>> getVerifiedClinics() {

        List<Clinic> verified = clinicService.getVerifiedClinics();

        String message = verified.isEmpty()
                ? "No verified clinics found"
                : "Fetched verified clinics successfully";

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        message,
                        verified,
                        HttpStatus.OK.value()
                )
        );
    }

    // ---------------------------------------------------
    // 10. LOGIN
    // ---------------------------------------------------
    @PostMapping("/clinics/login")
    public ResponseEntity<ApiResponse<ClinicPublicDTO>> login(
            @Valid @RequestBody ClinicLoginRequest request) {

        Clinic clinic = clinicService.login(request.getUsername(), request.getPassword());

        if (clinic == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(
                            false,
                            "Invalid username or password",
                            null,
                            HttpStatus.UNAUTHORIZED.value()
                    ));
        }

        ClinicPublicDTO dto = ClinicMapper.toPublicDTO(clinic);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Login successful",
                        dto,
                        HttpStatus.OK.value()
                )
        );
    }

    // ---------------------------------------------------
    // 11. UPDATE PASSWORD
    // ---------------------------------------------------
    @PutMapping("/clinics/updatePassword/{username}")
    public ResponseEntity<ApiResponse<?>> updatePassword(
            @PathVariable String username,
            @RequestBody ChangePasswordDTO dto) {

        dto.setUsername(username);

        clinicService.changePassword(dto);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Password updated successfully",
                        null,
                        HttpStatus.OK.value()
                )
        );
    }

    // ---------------------------------------------------
    // 12. FORGOT PASSWORD
    // ---------------------------------------------------
    @PostMapping("/clinics/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        ApiResponse<Void> resp = clinicService.forgotPassword(request);
        resp.setStatusCode(HttpStatus.OK.value());
        return ResponseEntity.ok(resp);
    }

    // ---------------------------------------------------
    // 13. RESET PASSWORD
    // ---------------------------------------------------
    @PostMapping("/clinics/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        ApiResponse<Void> resp = clinicService.resetPassword(request);
        resp.setStatusCode(HttpStatus.OK.value());
        return ResponseEntity.ok(resp);
    }

    // ---------------------------------------------------
    // 14. RESEND OTP
    // ---------------------------------------------------
    @PostMapping("/clinics/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(
            @Valid @RequestBody ForgotPasswordRequest request) {

        ApiResponse<Void> resp = clinicService.resendOtp(request);
        resp.setStatusCode(HttpStatus.OK.value());
        return ResponseEntity.ok(resp);
    }
    
 // ---------------------------------------------------
 // 15. PAYOUT LOGIN
 // ---------------------------------------------------
    @PostMapping("/clinics/payout-login")
    public ResponseEntity<ApiResponse<Void>> payoutLogin(
            @Valid @RequestBody PayoutLoginRequest request) {

        Clinic clinic = clinicService.payoutLogin(
                request.getPayoutUsername(),
                request.getPayoutPassword()
        );

        if (clinic == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(
                            false,
                            "Invalid payout username or password",
                            null,
                            HttpStatus.UNAUTHORIZED.value()
                    ));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payout login successful",
                        null,
                        HttpStatus.OK.value()
                )
        );
    }


 // ---------------------------------------------------
 // 16. CHANGE PAYOUT PASSWORD
 // ---------------------------------------------------
 @PutMapping("/clinics/updatePayoutPassword/{payoutUsername}")
 public ResponseEntity<ApiResponse<?>> changePayoutPassword(
         @PathVariable String payoutUsername,
         @RequestBody ChangePayoutPasswordDTO dto) {

     dto.setPayoutUsername(payoutUsername);

     clinicService.changePayoutPassword(dto);

     return ResponseEntity.ok(
             new ApiResponse<>(
                     true,
                     "Payout password updated successfully",
                     null,
                     HttpStatus.OK.value()
             )
     );
 }

 // ---------------------------------------------------
 // 17. PAYOUT FORGOT PASSWORD
 // ---------------------------------------------------
 @PostMapping("/clinics/payout-forgot-password")
 public ResponseEntity<ApiResponse<Void>> payoutForgotPassword(
         @Valid @RequestBody ForgotPasswordRequest request) {

     ApiResponse<Void> resp = clinicService.forgotPayoutPassword(request);
     resp.setStatusCode(HttpStatus.OK.value());
     return ResponseEntity.ok(resp);
 }

 // ---------------------------------------------------
 // 18. PAYOUT RESET PASSWORD
 // ---------------------------------------------------
 @PostMapping("/clinics/payout-reset-password")
 public ResponseEntity<ApiResponse<Void>> payoutResetPassword(
         @Valid @RequestBody ResetPasswordRequest request) {

     ApiResponse<Void> resp = clinicService.resetPayoutPassword(request);
     resp.setStatusCode(HttpStatus.OK.value());
     return ResponseEntity.ok(resp);
 }

 // ---------------------------------------------------
 // 19. PAYOUT RESEND OTP
 // ---------------------------------------------------
 @PostMapping("/clinics/payout-resend-otp")
 public ResponseEntity<ApiResponse<Void>> payoutResendOtp(
         @Valid @RequestBody ForgotPasswordRequest request) {

     ApiResponse<Void> resp = clinicService.resendPayoutOtp(request);
     resp.setStatusCode(HttpStatus.OK.value());
     return ResponseEntity.ok(resp);
 }

}

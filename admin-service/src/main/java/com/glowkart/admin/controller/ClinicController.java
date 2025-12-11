package com.glowkart.admin.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.admin.dto.*;
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
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable String clinicId) {

        Clinic clinic = clinicService.getById(clinicId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Clinic fetched successfully",
                        clinic,
                        HttpStatus.OK.value()
                )
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
}

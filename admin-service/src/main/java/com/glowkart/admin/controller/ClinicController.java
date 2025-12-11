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
import com.glowkart.admin.dto.ClinicLoginRequest;
import com.glowkart.admin.dto.ClinicPublicDTO;
import com.glowkart.admin.dto.ClinicRegistrationDTO;
import com.glowkart.admin.dto.ClinicRejectionRequest;
import com.glowkart.admin.dto.ForgotPasswordRequest;
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

    // ---------------------------------------------------
    // 1. REGISTER CLINIC (Status = PENDING)
    // ---------------------------------------------------
    @PostMapping("/clinics/register")
    public ResponseEntity<ApiResponse<?>> register(@Valid @RequestBody ClinicRegistrationDTO dto) {

        Clinic saved = clinicService.registerClinic(dto);

        return ResponseEntity.status(201).body(
                new ApiResponse<>(
                        true,
                        "Clinic registered successfully",
                        Map.of(
                                "clinicId", saved.getClinicId(),
                                "status", saved.getStatus()
                        )
                )
        );
    }

    // ---------------------------------------------------
    // 2. START VERIFICATION (Admin)
    // ---------------------------------------------------
    @PutMapping("/clinics/{clinicId}/start-verification")
    public ResponseEntity<ApiResponse<?>> startVerification(@PathVariable String clinicId) {
        Clinic clinic = clinicService.startVerificationProcess(clinicId);

        return ResponseEntity.ok(
            new ApiResponse<>(true, "Verification process started successfully",
                Map.of(
                    "clinicId", clinic.getClinicId(),
                    "status", clinic.getStatus()
                )
            )
        );
    }


    // ---------------------------------------------------
    // 3. MARK CLINIC VERIFIED
    // ---------------------------------------------------
    @PutMapping("/clinics/{clinicId}/verify")
    public ResponseEntity<ApiResponse<?>> verifyClinic(@PathVariable String clinicId) {
        Clinic clinic = clinicService.verifyClinic(clinicId);

        return ResponseEntity.ok(
            new ApiResponse<>(true, "Clinic verified successfully",
                Map.of(
                    "clinicId", clinic.getClinicId(),
                    "status", clinic.getStatus()
                )
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
                        )
                )
        );
    }



    // ---------------------------------------------------
    // 5. GET ALL CLINICS
    // ---------------------------------------------------
    @GetMapping("/clinics")
    public ResponseEntity<ApiResponse<?>> getAll() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Fetched clinics successfully",
                        clinicService.getAll()
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
                new ApiResponse<>(true, "Clinic fetched successfully", clinic)
        );
    }

    // ---------------------------------------------------
    // 7. UPDATE CLINIC (Partial Update)
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
                        updated
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
                new ApiResponse<>(true, "Clinic deleted successfully", null)
        );
    }

    @GetMapping("/clinics/verified")
    public ResponseEntity<ApiResponse<?>> getVerifiedClinics() {
        List<Clinic> verifiedClinics = clinicService.getVerifiedClinics();

        String message = verifiedClinics.isEmpty() ? "No verified clinics found" : "Fetched verified clinics successfully";

        return ResponseEntity.ok(
            new ApiResponse<>(
                true,
                message,
                verifiedClinics
            )
        );
    }

    // ---------------------------------------------------
    // 9. CLINIC LOGIN
    // ---------------------------------------------------
    @PostMapping("/clinics/login")
    public ResponseEntity<ApiResponse<ClinicPublicDTO>> login(@RequestBody @Valid ClinicLoginRequest request) {
        Clinic clinic = clinicService.login(request.getUsername(), request.getPassword());

        if (clinic == null) {
            // Return JSON-friendly 401 response
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Invalid username or password", null));
        }

        ClinicPublicDTO dto = ClinicMapper.toPublicDTO(clinic);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", dto));
    }

    
    @PutMapping("/clinics/updatePassword/{username}")
    public ResponseEntity<ApiResponse<?>> updatePassword(
            @PathVariable String username,
            @RequestBody ChangePasswordDTO dto) {

        dto.setUsername(username); // inject username into DTO

        clinicService.changePassword(dto);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Password updated successfully", null)
        );
    }

    
    @PostMapping("/clinics/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        // Call service and get ApiResponse
        ApiResponse<Void> response = clinicService.forgotPassword(request);

        // Return the service response directly
        return ResponseEntity.ok(response);
    }

    @PostMapping("/clinics/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        // Call service and get ApiResponse
        ApiResponse<Void> response = clinicService.resetPassword(request);

        // Return the service response directly
        return ResponseEntity.ok(response);
    }

    @PostMapping("/clinics/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(
            @Valid @RequestBody ForgotPasswordRequest request) {

        // Call service and get ApiResponse
        ApiResponse<Void> response = clinicService.resendOtp(request);

        // Return the service response directly
        return ResponseEntity.ok(response);
    }

}

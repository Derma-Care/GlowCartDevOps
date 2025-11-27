package com.glowkart.admin.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ClinicLoginRequest;
import com.glowkart.admin.dto.ClinicLoginResponse;
import com.glowkart.admin.dto.ClinicRegistrationDTO;
import com.glowkart.admin.dto.ClinicRejectionRequest;
import com.glowkart.admin.model.Clinic;
import com.glowkart.admin.service.ClinicService;

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

    // ---------------------------------------------------
    // 9. CLINIC LOGIN
    // ---------------------------------------------------
    @PostMapping("/clinics/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody ClinicLoginRequest request) {

        Clinic clinic = clinicService.login(request.getUsername(), request.getPassword());

        ClinicLoginResponse response = new ClinicLoginResponse(
                "Login successful",
                clinic.getClinicId(),
                clinic.getName(),
                clinic.getStatus()
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Login successful",
                        response
                )
        );
    }
}

package com.glowkart.admin.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.admin.dto.ClinicLoginRequest;
import com.glowkart.admin.dto.ClinicLoginResponse;
import com.glowkart.admin.dto.ClinicRegistrationDTO;
import com.glowkart.admin.model.Clinic;
import com.glowkart.admin.service.ClinicService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ClinicController {

    private final ClinicService clinicService;

    public ClinicController(ClinicService clinicService) {
        this.clinicService = clinicService;
    }

    // -----------------------------------------
    // 1. REGISTER CLINIC -> Status = PENDING
    // -----------------------------------------
    @PostMapping("/clinics/register")
    public ResponseEntity<?> register(@Valid @RequestBody ClinicRegistrationDTO dto) {
        try {
            Clinic saved = clinicService.registerClinic(dto);
            return ResponseEntity.status(201).body(Map.of(
                    "message", "Clinic registered successfully",
                    "status", saved.getStatus(),
                    "clinicId", saved.getClinicId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // -----------------------------------------------------------
    // 2. MAIN ADMIN STARTS VERIFICATION -> Status = VERIFICATION_IN_PROGRESS
    // -----------------------------------------------------------
    @PutMapping("/clinics/{clinicId}/start-verification")
    public ResponseEntity<?> startVerification(@PathVariable String clinicId) {
        try {
            clinicService.startVerificationProcess(clinicId);
            return ResponseEntity.ok(Map.of("message", "Verification process started successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // -----------------------------------------------------------
    // 3. MAIN ADMIN MARKS VERIFIED -> Status = VERIFIED
    // -----------------------------------------------------------
    @PutMapping("/clinics/{clinicId}/verify")
    public ResponseEntity<?> verifyClinic(@PathVariable String clinicId) {
        try {
            clinicService.verifyClinic(clinicId);
            return ResponseEntity.ok(Map.of("message", "Clinic verified successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // -----------------------------------------------------------
    // 4. MAIN ADMIN REJECTS CLINIC -> Status = REJECTED
    // -----------------------------------------------------------
    @PutMapping("/clinics/{clinicId}/reject")
    public ResponseEntity<?> rejectClinic(
            @PathVariable String clinicId,
            @RequestParam String reason) {
        try {
            clinicService.rejectClinic(clinicId, reason);
            return ResponseEntity.ok(Map.of("message", "Clinic rejected successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // -----------------------------------------
    // GET ALL CLINICS
    // -----------------------------------------
    @GetMapping("/clinics")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(clinicService.getAll());
    }

    // -----------------------------------------
    // GET CLINIC BY ID
    // -----------------------------------------
    @GetMapping("/clinics/{clinicId}")
    public ResponseEntity<?> getById(@PathVariable String clinicId) {
        try {
            return ResponseEntity.ok(clinicService.getById(clinicId));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // -----------------------------------------
    // UPDATE CLINIC – PARTIAL UPDATE
    // -----------------------------------------
    @PutMapping("/clinics/{clinicId}")
    public ResponseEntity<Clinic> updateClinic(
            @PathVariable String clinicId,
            @RequestBody ClinicRegistrationDTO dto) {
        Clinic updatedClinic = clinicService.updateClinic(clinicId, dto);
        return ResponseEntity.ok(updatedClinic);
    }

    // -----------------------------------------
    // DELETE CLINIC
    // -----------------------------------------
    @DeleteMapping("/clinics/{clinicId}")
    public ResponseEntity<?> delete(@PathVariable String clinicId) {
        try {
            clinicService.deleteClinic(clinicId);
            return ResponseEntity.ok(Map.of("message", "Clinic deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // -----------------------------------------
    // LOGIN CLINIC
    // -----------------------------------------
    @PostMapping("/clinics/login")
    public ResponseEntity<?> login(@Valid @RequestBody ClinicLoginRequest request) {

        try {
            Clinic clinic = clinicService.login(request.getUsername(), request.getPassword());

            ClinicLoginResponse response = new ClinicLoginResponse(
                    "Login successful",
                    clinic.getClinicId(),
                    clinic.getName(),
                    clinic.getStatus()
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));

        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

}

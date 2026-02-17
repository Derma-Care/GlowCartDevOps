package com.glowkart.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ClinicEnquiryDTO;
import com.glowkart.admin.service.AdminClinicEnquiryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Validated
public class AdminClinicEnquiryController {

    private final AdminClinicEnquiryService service;

    @GetMapping("/clinic-enquiries/getAll")
    public ResponseEntity<ApiResponse<List<ClinicEnquiryDTO>>> getAllEnquiries() {
        return ResponseEntity.ok(service.getAllEnquiries());
    }

    @GetMapping("/clinic-enquiries/{id}")
    public ResponseEntity<ApiResponse<ClinicEnquiryDTO>> getEnquiryById(@PathVariable("id") String id) {
        return ResponseEntity.ok(service.getEnquiryById(id));
    }

    @GetMapping("/clinic-enquiries/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<List<ClinicEnquiryDTO>>> getByClinicId(@PathVariable String clinicId) {
        return ResponseEntity.ok(service.getEnquiriesByClinicId(clinicId));
    }

    @PostMapping("/clinic-enquiries/create")
    public ResponseEntity<ApiResponse<ClinicEnquiryDTO>> createEnquiry(@Valid @RequestBody ClinicEnquiryDTO dto) {
        return ResponseEntity.ok(service.createEnquiry(dto));
    }

    @PutMapping("/clinic-enquiries/{id}")
    public ResponseEntity<ApiResponse<ClinicEnquiryDTO>> updateEnquiry(
            @PathVariable("id") String id,
            @Valid @RequestBody ClinicEnquiryDTO dto) {

        if (dto.getId() != null && !dto.getId().equals(id)) {
            throw new IllegalArgumentException("Path ID and Body ID do not match");
        }

        return ResponseEntity.ok(service.updateEnquiry(id, dto));
    }

    @DeleteMapping("/clinic-enquiries/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEnquiry(@PathVariable("id") String id) {
        return ResponseEntity.ok(service.deleteEnquiry(id));
    }
}

package com.glowkart.clinicadmin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ClinicEnquiryDTO;
import com.glowkart.clinicadmin.service.ClinicEnquiryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/clinic-admin")
@RequiredArgsConstructor
@Validated
public class ClinicEnquiryController {

    private final ClinicEnquiryService clinicEnquiryService;

    @PostMapping("/clinic-enquiries/create")
    public ResponseEntity<ApiResponse<ClinicEnquiryDTO>> createEnquiry(
            @Valid @RequestBody ClinicEnquiryDTO dto) {

        ApiResponse<ClinicEnquiryDTO> response =
                clinicEnquiryService.createEnquiry(dto);

        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/clinic-enquiries/{id}")
    public ResponseEntity<ApiResponse<ClinicEnquiryDTO>> updateEnquiry(
            @PathVariable String id,
            @Valid @RequestBody ClinicEnquiryDTO dto) {

        if (dto.getId() != null && !dto.getId().equals(id)) {
            throw new IllegalArgumentException("Path ID and Body ID do not match");
        }

        return ResponseEntity.ok(
                clinicEnquiryService.updateEnquiry(id, dto));
    }


    @GetMapping("/clinic-enquiries/getAll")
    public ResponseEntity<ApiResponse<List<ClinicEnquiryDTO>>> getAllEnquiries() {

        return ResponseEntity.ok(clinicEnquiryService.getAllEnquiries());
    }

    @GetMapping("/clinic-enquiries/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<List<ClinicEnquiryDTO>>> getByClinicId(
            @PathVariable String clinicId) {

        return ResponseEntity.ok(
                clinicEnquiryService.getEnquiriesByClinicId(clinicId));
    }

    @GetMapping("/clinic-enquiries/{id}")
    public ResponseEntity<ApiResponse<ClinicEnquiryDTO>> getById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                clinicEnquiryService.getEnquiryById(id));
    }

    @DeleteMapping("/clinic-enquiries/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEnquiry(
            @PathVariable String id) {

        return ResponseEntity.ok(
                clinicEnquiryService.deleteEnquiry(id));
    }
}

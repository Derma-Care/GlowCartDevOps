package com.glowkart.admin.controller;

import java.util.List;

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
import com.glowkart.admin.dto.ClinicEnquiryDTO;
import com.glowkart.admin.service.AdminClinicEnquiryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminClinicEnquiryController {

    private final AdminClinicEnquiryService service;

    @GetMapping("/clinic-enquiries/getAll")
    public ResponseEntity<ApiResponse<List<ClinicEnquiryDTO>>> getAllEnquiries() {
        return ResponseEntity.ok(service.getAllEnquiries());
    }

    @GetMapping("/clinic-enquiries/{id}")
    public ResponseEntity<ApiResponse<ClinicEnquiryDTO>> getEnquiryById(@PathVariable String id) {
        return ResponseEntity.ok(service.getEnquiryById(id));
    }

    @GetMapping("/clinic-enquiries/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<List<ClinicEnquiryDTO>>> getByClinicId(@PathVariable String clinicId) {
        return ResponseEntity.ok(service.getEnquiriesByClinicId(clinicId));
    }

    @PostMapping("/clinic-enquiries/create")
    public ResponseEntity<ApiResponse<ClinicEnquiryDTO>> createEnquiry(@RequestBody ClinicEnquiryDTO dto) {
        return ResponseEntity.ok(service.createEnquiry(dto));
    }

    @PutMapping("/clinic-enquiries/{id}")
    public ResponseEntity<ApiResponse<ClinicEnquiryDTO>> updateEnquiry(@PathVariable String id,
                                                                       @RequestBody ClinicEnquiryDTO dto) {
        return ResponseEntity.ok(service.updateEnquiry(id, dto));
    }

    @DeleteMapping("/clinic-enquiries/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEnquiry(@PathVariable String id) {
        return ResponseEntity.ok(service.deleteEnquiry(id));
    }
}

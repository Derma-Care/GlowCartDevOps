package com.glowkart.admin.controller;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ProcedurePricingDTO;
import com.glowkart.admin.service.ProcedurePricingAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class ProcedurePricingAdminController {

    private final ProcedurePricingAdminService service;

    @PostMapping("/pricing/create")
    public ResponseEntity<ApiResponse<ProcedurePricingDTO>> createPricing(@RequestBody ProcedurePricingDTO dto) {
        return ResponseEntity.ok(service.createPricing(dto));
    }

    @GetMapping("/pricing/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<List<ProcedurePricingDTO>>> getPricingByClinic(@PathVariable String clinicId) {
        return ResponseEntity.ok(service.getPricingByClinic(clinicId));
    }

    @GetMapping("/pricing/{procedureId}/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<ProcedurePricingDTO>> getPricingByProcedureAndClinic(
            @PathVariable String procedureId,
            @PathVariable String clinicId) {
        return ResponseEntity.ok(service.getPricingByProcedureAndClinic(procedureId, clinicId));
    }

    @PutMapping("/pricing/update/{procedureId}/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<ProcedurePricingDTO>> updatePricing(
            @PathVariable String procedureId,
            @PathVariable String clinicId,
            @RequestBody ProcedurePricingDTO dto) {
        return ResponseEntity.ok(service.updatePricing(procedureId, clinicId, dto));
    }

    @DeleteMapping("/pricing/delete/{procedureId}/clinic/{clinicId}")
    public ResponseEntity<ApiResponse<Void>> deletePricing(
            @PathVariable String procedureId,
            @PathVariable String clinicId) {
        return ResponseEntity.ok(service.deletePricing(procedureId, clinicId));
    }

 // New API endpoint to fetch procedure pricing by procedureId
    @GetMapping("/pricing/procedure/{procedureId}")
    public ResponseEntity<ApiResponse<ProcedurePricingDTO>> getPricingByProcedure(
            @PathVariable String procedureId) {
        return ResponseEntity.ok(service.getPricingByProcedureId(procedureId));
    }

    @GetMapping("/pricing/all")
    public ResponseEntity<ApiResponse<List<ProcedurePricingDTO>>> getAllPricing() {
        return ResponseEntity.ok(service.getAllPricing());
    }
}

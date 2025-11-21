package com.glowkart.clinicadmin.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ProcedurePricingDTO;
import com.glowkart.clinicadmin.service.ClinicProcedurePricingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/clinic-admin")
@RequiredArgsConstructor
public class ClinicProcedurePricingController {

    private final ClinicProcedurePricingService pricingService;

    @PostMapping("/procedure-pricing/create")
    public ApiResponse<ProcedurePricingDTO> create(@RequestBody ProcedurePricingDTO dto) {
        return pricingService.create(dto);
    }

    @GetMapping("/procedure-pricing/all/{clinicId}")
    public ApiResponse<List<ProcedurePricingDTO>> getByClinic(@PathVariable String clinicId) {
        return pricingService.getByClinic(clinicId);
    }

    @GetMapping("/procedure-pricing/get/{procedureId}/{clinicId}")
    public ApiResponse<ProcedurePricingDTO> getByProcedureAndClinic(
            @PathVariable String procedureId,
            @PathVariable String clinicId) {
        return pricingService.getByProcedureAndClinic(procedureId, clinicId);
    }

    @PutMapping("/procedure-pricing/update/{procedureId}/{clinicId}")
    public ApiResponse<ProcedurePricingDTO> update(
            @PathVariable String procedureId,
            @PathVariable String clinicId,
            @RequestBody ProcedurePricingDTO dto) {
        return pricingService.update(procedureId, clinicId, dto);
    }

    @DeleteMapping("/procedure-pricing/delete/{procedureId}/{clinicId}")
    public ApiResponse<Void> delete(
            @PathVariable String procedureId,
            @PathVariable String clinicId) {
        return pricingService.delete(procedureId, clinicId);
    }
    
 // New API endpoint to fetch all procedure pricing data
    @GetMapping("/procedure-pricing/all")
    public ApiResponse<List<ProcedurePricingDTO>> getAllProcedurePricing() {
        return pricingService.getAllProcedurePricing();
    }
}


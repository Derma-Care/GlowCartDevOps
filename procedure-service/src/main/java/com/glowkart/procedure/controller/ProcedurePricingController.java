package com.glowkart.procedure.controller;

import com.glowkart.procedure.dto.ApiResponse;
import com.glowkart.procedure.dto.ProcedurePricingDTO;
import com.glowkart.procedure.service.ProcedurePricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/procedures")
@RequiredArgsConstructor
public class ProcedurePricingController {

    private final ProcedurePricingService service;

    @PostMapping("/pricing/create")
    public ApiResponse<ProcedurePricingDTO> create(@RequestBody ProcedurePricingDTO dto) {
        return new ApiResponse<>(true, "Procedure Created", service.create(dto));
    }

    @GetMapping("/pricing/all/{clinicId}")
    public ApiResponse<List<ProcedurePricingDTO>> getByClinic(@PathVariable String clinicId) {
        return new ApiResponse<>(true, "Data Fetched", service.getByClinic(clinicId));
    }

    // ⭐ New Method
    @GetMapping("/pricing/get/{procedureId}/{clinicId}")
    public ApiResponse<ProcedurePricingDTO> getByProcedureAndClinic(
            @PathVariable String procedureId,
            @PathVariable String clinicId) {

        return new ApiResponse<>(true, "Data Fetched",
                service.getByProcedureAndClinic(procedureId, clinicId));
    }

    @PutMapping("/pricing/update/{procedureId}/{clinicId}")
    public ApiResponse<ProcedurePricingDTO> update(
            @PathVariable String procedureId,
            @PathVariable String clinicId,
            @RequestBody ProcedurePricingDTO dto) {
        return new ApiResponse<>(true, "Updated", service.update(procedureId, clinicId, dto));
    }

    @DeleteMapping("/pricing/delete/{procedureId}/{clinicId}")
    public ApiResponse<Void> delete(
            @PathVariable String procedureId,
            @PathVariable String clinicId) {
        service.delete(procedureId, clinicId);
        return new ApiResponse<>(true, "Deleted", null);
    }
}

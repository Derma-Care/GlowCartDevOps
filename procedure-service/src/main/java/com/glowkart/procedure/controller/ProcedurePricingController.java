package com.glowkart.procedure.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.procedure.dto.ApiResponse;
import com.glowkart.procedure.dto.ProcedureOfferDTO;
import com.glowkart.procedure.dto.ProcedurePricingDTO;
import com.glowkart.procedure.service.ProcedurePricingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/procedures")
@RequiredArgsConstructor
public class ProcedurePricingController {

    private final ProcedurePricingService service;

    @PostMapping("/pricing/create")
    public ApiResponse<ProcedurePricingDTO> create(@Valid @RequestBody ProcedurePricingDTO dto) {
        return new ApiResponse<>(true, "Procedure pricing created successfully", service.create(dto));
    }

    @GetMapping("/pricing/all/{clinicId}")
    public ApiResponse<List<ProcedurePricingDTO>> getByClinic(@PathVariable String clinicId) {
        return new ApiResponse<>(true, "Procedures fetched successfully", service.getByClinic(clinicId));
    }

    @GetMapping("/pricing/all")
    public ApiResponse<List<ProcedurePricingDTO>> getAll() {
        return new ApiResponse<>(true, "All procedure pricing fetched successfully", service.getAll());
    }

    @GetMapping("/pricing/get/{procedureId}/{clinicId}")
    public ApiResponse<ProcedurePricingDTO> getByProcedureAndClinic(
            @PathVariable String procedureId,
            @PathVariable String clinicId) {
        return new ApiResponse<>(true, "Procedure pricing fetched successfully",
                service.getByProcedureAndClinic(procedureId, clinicId));
    }
    
    @GetMapping("/pricing/get/{procedureId}")
    public ApiResponse<ProcedurePricingDTO> getByProcedure(@PathVariable String procedureId) {
        return new ApiResponse<>(true, "Procedure pricing fetched successfully",
                service.getByProcedureId(procedureId));
    }


    @PutMapping("/pricing/update/{procedureId}/{clinicId}")
    public ApiResponse<ProcedurePricingDTO> update(
            @PathVariable String procedureId,
            @PathVariable String clinicId,
            @Valid @RequestBody ProcedurePricingDTO dto) {
        return new ApiResponse<>(true, "Procedure pricing updated successfully",
                service.update(procedureId, clinicId, dto));
    }

    @DeleteMapping("/pricing/delete/{procedureId}/{clinicId}")
    public ApiResponse<Void> delete(@PathVariable String procedureId, @PathVariable String clinicId) {
        service.delete(procedureId, clinicId);
        return new ApiResponse<>(true, "Procedure pricing deleted successfully", null);
    }
    
    @GetMapping("/pricing/offers")
    public ApiResponse<List<ProcedureOfferDTO>> getProcedureOffers() {
        List<ProcedureOfferDTO> offers = service.getProcedureOffers();
        return new ApiResponse<>(true, "Procedure offers fetched successfully", offers);
    }

}

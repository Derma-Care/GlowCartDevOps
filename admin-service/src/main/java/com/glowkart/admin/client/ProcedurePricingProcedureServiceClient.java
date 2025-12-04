package com.glowkart.admin.client;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ProcedurePricingDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "procedure-service", contextId = "procedurePricingClient")
public interface ProcedurePricingProcedureServiceClient {

    @PostMapping("/procedures/pricing/create")
    ApiResponse<ProcedurePricingDTO> createPricing(@RequestBody ProcedurePricingDTO dto);

    @GetMapping("/procedures/pricing/all/{clinicId}")
    ApiResponse<List<ProcedurePricingDTO>> getPricingByClinic(@PathVariable String clinicId);

    @GetMapping("/procedures/pricing/get/{procedureId}/{clinicId}")
    ApiResponse<ProcedurePricingDTO> getPricingByProcedureAndClinic(
            @PathVariable String procedureId,
            @PathVariable String clinicId
    );

    @PutMapping("/procedures/pricing/update/{procedureId}/{clinicId}")
    ApiResponse<ProcedurePricingDTO> updatePricing(
            @PathVariable String procedureId,
            @PathVariable String clinicId,
            @RequestBody ProcedurePricingDTO dto
    );

    @DeleteMapping("/procedures/pricing/delete/{procedureId}/{clinicId}")
    ApiResponse<Void> deletePricing(
            @PathVariable String procedureId,
            @PathVariable String clinicId
    );
    
 // New method to fetch pricing by procedureId
    @GetMapping("/procedures/pricing/get/{procedureId}")
    ApiResponse<ProcedurePricingDTO> getPricingByProcedureId(@PathVariable String procedureId);


    @GetMapping("/procedures/pricing/all")
    ApiResponse<List<ProcedurePricingDTO>> getAllPricing();
}

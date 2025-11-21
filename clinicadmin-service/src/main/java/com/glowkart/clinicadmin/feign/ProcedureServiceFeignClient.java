package com.glowkart.clinicadmin.feign;

import com.glowkart.clinicadmin.dto.ProcedurePricingDTO;
import com.glowkart.clinicadmin.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "procedure-service")  // Eureka service name
public interface ProcedureServiceFeignClient {

    @PostMapping("/procedures/pricing/create")
    ApiResponse<ProcedurePricingDTO> create(@RequestBody ProcedurePricingDTO dto);

    @GetMapping("/procedures/pricing/all/{clinicId}")
    ApiResponse<List<ProcedurePricingDTO>> getByClinic(@PathVariable String clinicId);

    @GetMapping("/procedures/pricing/get/{procedureId}/{clinicId}")
    ApiResponse<ProcedurePricingDTO> getByProcedureAndClinic(
            @PathVariable String procedureId,
            @PathVariable String clinicId
    );

    @PutMapping("/procedures/pricing/update/{procedureId}/{clinicId}")
    ApiResponse<ProcedurePricingDTO> update(
            @PathVariable String procedureId,
            @PathVariable String clinicId,
            @RequestBody ProcedurePricingDTO dto
    );

    @DeleteMapping("/procedures/pricing/delete/{procedureId}/{clinicId}")
    ApiResponse<Void> delete(
            @PathVariable String procedureId,
            @PathVariable String clinicId
    );
    
    // New method to fetch all procedure pricing data
    @GetMapping("/procedures/pricing/all")
    ApiResponse<List<ProcedurePricingDTO>> getAll();
}

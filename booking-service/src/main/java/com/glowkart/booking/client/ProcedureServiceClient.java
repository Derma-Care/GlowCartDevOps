package com.glowkart.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.glowkart.booking.dto.ApiResponse;
import com.glowkart.booking.dto.ProcedurePackageDTO;
import com.glowkart.booking.dto.ProcedurePricingDTO;

@FeignClient(name = "procedure-service")
public interface ProcedureServiceClient {
    @GetMapping("/procedures/pricing/get/{procedureId}")
    ApiResponse<ProcedurePricingDTO> getPricingByProcedure(@PathVariable String procedureId);
    
    

    // Fetch procedure pricing for a specific clinic
    @GetMapping("/procedures/pricing/get/{procedureId}/{clinicId}")
    ApiResponse<ProcedurePricingDTO> getPricingByProcedureAndClinic(
            @PathVariable String procedureId,
            @PathVariable String clinicId
    );

    // PACKAGE pricing
    @GetMapping("/procedures/packages/{packageId}")
    ApiResponse<ProcedurePackageDTO> getPricingByPackage(
            @PathVariable String packageId
    );
    
    
    // Fetch package pricing for a specific clinic
    @GetMapping("/procedures/packages/clinic/{clinicId}/{packageId}")
    ApiResponse<ProcedurePackageDTO> getPricingByPackageAndClinic(
            @PathVariable String packageId,
            @PathVariable String clinicId
    );
}

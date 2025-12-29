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

    // PACKAGE pricing
    @GetMapping("/procedures/packages/{packageId}")
    ApiResponse<ProcedurePackageDTO> getPricingByPackage(
            @PathVariable String packageId
    );
}

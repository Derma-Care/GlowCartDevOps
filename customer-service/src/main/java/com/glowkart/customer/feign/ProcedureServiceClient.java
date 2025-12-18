package com.glowkart.customer.feign;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.ProcedureDTO;
import com.glowkart.customer.dto.ProcedurePackageDTO;
import com.glowkart.customer.dto.ProcedurePricingDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "procedure-service")
public interface ProcedureServiceClient {

    // 1️⃣ All procedures
    @GetMapping("/procedures/all")
    ApiResponse<List<ProcedureDTO>> getAllProcedures();

    // 2️⃣ Packages for a clinic
    @GetMapping("/procedures/packages/clinic/{clinicId}")
    ApiResponse<List<ProcedurePackageDTO>> getPackagesByClinic(@PathVariable("clinicId") String clinicId);

    // 3️⃣ Pricing for all procedures in a clinic
    @GetMapping("/procedures/pricing/all/{clinicId}")
    ApiResponse<List<ProcedurePricingDTO>> getPricingByClinic(@PathVariable("clinicId") String clinicId);

    // 4️⃣ Pricing for a specific procedure in a clinic
    @GetMapping("/procedures/pricing/get/{procedureId}/{clinicId}")
    ApiResponse<ProcedurePricingDTO> getPricingByProcedureAndClinic(
            @PathVariable("procedureId") String procedureId,
            @PathVariable("clinicId") String clinicId
    );

    // 5️⃣ Pricing for a procedure (without clinic) if needed
    @GetMapping("/procedures/pricing/get/{procedureId}")
    ApiResponse<ProcedurePricingDTO> getPricingByProcedure(@PathVariable("procedureId") String procedureId);
}

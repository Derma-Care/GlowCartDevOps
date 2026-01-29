package com.glowkart.customer.feign;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CustomerProcedureOfferDTO;
import com.glowkart.customer.dto.ProcedureDTO;
import com.glowkart.customer.dto.ProcedurePackageDTO;
import com.glowkart.customer.dto.ProcedurePricingDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "procedure-service")
public interface ProcedureServiceClient {

    // 1️⃣ All procedures (master list)
    @GetMapping("/procedures/all")
    ApiResponse<List<ProcedureDTO>> getAllProcedures();

    // 2️⃣ All packages (across all clinics)
    @GetMapping("/procedures/packages/all")
    ApiResponse<List<ProcedurePackageDTO>> getAllPackages();

    // 3️⃣ Pricing for a procedure (best / default / lowest)
    @GetMapping("/procedures/pricing/get/{procedureId}")
    ApiResponse<ProcedurePricingDTO> getPricingByProcedure(
            @PathVariable("procedureId") String procedureId
    );
    
    @GetMapping("/procedures/pricing/get/{procedureId}/{clinicId}")
    ApiResponse<ProcedurePricingDTO> getPricingByProcedureForClinic(
        @PathVariable("procedureId") String procedureId,
        @PathVariable("clinicId") String clinicId
    );
    
    @GetMapping("/procedures/pricing/offers")
    ApiResponse<List<CustomerProcedureOfferDTO>> getProcedureOffers();
    
 // 🔥 NEW: get clinic IDs offering this procedure
    @GetMapping("/procedures/pricing/clinics/{procedureId}")
    ApiResponse<List<String>> getClinicIdsByProcedure(
            @PathVariable String procedureId
    );
    
 // 🔥 NEW: get clinic IDs offering this package
    @GetMapping("/procedures/packages/clinics/{packageId}")
    ApiResponse<List<String>> getClinicIdsByPackage(
            @PathVariable String packageId
    );

    // 🔥 NEW: get pricing for a package at a specific clinic
    @GetMapping("/procedures/packages/clinic/{clinicId}/{packageId}")
    ApiResponse<ProcedurePricingDTO> getPackagePricingForClinic(
            @PathVariable String clinicId,
            @PathVariable String packageId
    );

    @GetMapping("/procedures/packages/clinic/{clinicId}")
    ApiResponse<List<ProcedurePackageDTO>> getPackagesByClinic(@PathVariable("clinicId") String clinicId);

    @GetMapping("/procedures/pricing/all/{clinicId}")
    ApiResponse<List<ProcedurePricingDTO>> getProceduresByClinic(@PathVariable("clinicId") String clinicId);

}

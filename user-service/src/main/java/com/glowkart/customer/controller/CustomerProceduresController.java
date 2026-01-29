package com.glowkart.customer.controller;

import com.glowkart.customer.dto.ProcedureDTO;
import com.glowkart.customer.dto.ProcedurePackageDTO;
import com.glowkart.customer.dto.ProcedurePricingDTO;
import com.glowkart.customer.dto.CustomerProcedureOfferDTO;
import com.glowkart.customer.service.ProcedureIntegrationService;
import com.glowkart.customer.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CustomerProceduresController {

    private final ProcedureIntegrationService procedureIntegrationService;

    // 1️⃣ Get all procedures (browse)
    @GetMapping("/customer/procedures")
    public ResponseEntity<ApiResponse<List<ProcedureDTO>>> getAllProcedures() {
        List<ProcedureDTO> procedures = procedureIntegrationService.getAllProcedures();
        return ResponseEntity.ok(
                new ApiResponse<>(true, "All procedures fetched successfully", procedures)
        );
    }

    // 2️⃣ Get all procedure offers (clinic-agnostic)
    @GetMapping("/customer/procedures/offers")
    public ResponseEntity<ApiResponse<List<CustomerProcedureOfferDTO>>> getProcedureOffers() {
        List<CustomerProcedureOfferDTO> offers = procedureIntegrationService.getProcedureOffers();
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Procedure offers fetched successfully", offers)
        );
    }

    // 3️⃣ Get procedure pricing (starting price)
    @GetMapping("/customer/procedures/{procedureId}/pricing")
    public ResponseEntity<ApiResponse<ProcedurePricingDTO>> getProcedurePricing(
            @PathVariable String procedureId) {

        ProcedurePricingDTO pricing = procedureIntegrationService.getProcedurePricing(procedureId);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Procedure pricing fetched successfully", pricing)
        );
    }

//    // 4️⃣ Get all packages (across all clinics)
//    @GetMapping("/customer/procedures/packages")
//    public ResponseEntity<ApiResponse<List<ProcedurePackageDTO>>> getAllPackages() {
//        List<ProcedurePackageDTO> packages = procedureIntegrationService.getAllPackages();
//        return ResponseEntity.ok(
//                new ApiResponse<>(true, "All procedure packages fetched successfully", packages)
//        );
//    }
}

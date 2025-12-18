package com.glowkart.customer.controller;

import com.glowkart.customer.dto.ProcedureDTO;
import com.glowkart.customer.dto.ProcedurePackageDTO;
import com.glowkart.customer.dto.ProcedurePricingDTO;
import com.glowkart.customer.service.ProcedureIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CustomerProceduresController {

    private final ProcedureIntegrationService procedureIntegrationService;

    // 1️⃣ Get all procedures
    @GetMapping("/customer/procedures/all")
    public ResponseEntity<List<ProcedureDTO>> getAllProcedures() {
        return ResponseEntity.ok(procedureIntegrationService.getAllProcedures());
    }

    // 2️⃣ Get procedure offers for a clinic
    @GetMapping("/customer/procedures/offers/{clinicId}")
    public ResponseEntity<Map<String, Object>> getProcedureOffers(@PathVariable String clinicId) {
        Map<String, Object> response = procedureIntegrationService.getProcedureOffersWithRange(clinicId);
        return ResponseEntity.ok(response);
    }


    // 3️⃣ Get detailed pricing for a specific procedure & clinic
    @GetMapping("/customer/procedures/{procedureId}/pricing/{clinicId}")
    public ResponseEntity<ProcedurePricingDTO> getProcedurePricing(
            @PathVariable String procedureId,
            @PathVariable String clinicId) {
        return ResponseEntity.ok(procedureIntegrationService.getProcedurePricing(procedureId, clinicId));
    }

    // 4️⃣ Get all packages for a clinic
    @GetMapping("/customer/procedures/packages/{clinicId}")
    public ResponseEntity<List<ProcedurePackageDTO>> getPackagesByClinic(@PathVariable String clinicId) {
        return ResponseEntity.ok(procedureIntegrationService.getPackagesByClinic(clinicId));
    }
}

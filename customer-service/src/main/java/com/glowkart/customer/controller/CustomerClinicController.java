package com.glowkart.customer.controller;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.ClinicProcedureLinkDTO;
import com.glowkart.customer.service.CustomerClinicSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CustomerClinicController {

    private final CustomerClinicSearchService service;

    /**
     * 🔥 FRONTEND CALLS THIS API
     *
     * lat, lng → auto state
     * procedureId → filter clinics
     */
    @GetMapping("/customer/procedures/clinics")
    public ApiResponse<List<ClinicProcedureLinkDTO>> getClinicsForProcedure(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam String procedureId) {

        return new ApiResponse<>(
                true,
                "Clinics fetched for procedure and location",
                service.findClinicsForProcedure(latitude, longitude, procedureId)
        );
    }
}

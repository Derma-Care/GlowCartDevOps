package com.glowkart.customer.controller;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.ClinicProcedureLinkDTO;
import com.glowkart.customer.dto.ProcedurePackageWithClinicsDTO;
import com.glowkart.customer.service.CustomerClinicSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CustomerClinicController {

    private final CustomerClinicSearchService customerClinicSearchService;

    /**
     * 🔥 FRONTEND CALLS THIS API
     *
     * Get all clinics offering a specific procedure for a given location
     * Sorted by distance from user
     *
     * @param latitude  user latitude
     * @param longitude user longitude
     * @param procedureId procedure id
     * @return list of clinics
     */
    @GetMapping("/customer/procedures/clinics")
    public ResponseEntity<ApiResponse<List<ClinicProcedureLinkDTO>>> getClinicsForProcedure(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam String procedureId
    ) {
        List<ClinicProcedureLinkDTO> clinics = customerClinicSearchService
                .findClinicsForProcedure(latitude, longitude, procedureId);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Clinics fetched for procedure and location", clinics)
        );
    }

    /**
     * 🔥 FRONTEND CALLS THIS API
     *
     * Get all procedure packages and clinics offering them for a given location
     * Sorted by distance
     *
     * @param latitude user latitude
     * @param longitude user longitude
     * @return list of packages with clinics
     */
    @GetMapping("/customer/procedures/packages")
    public ResponseEntity<ApiResponse<List<ProcedurePackageWithClinicsDTO>>> getAllPackagesWithClinics(
            @RequestParam double latitude,
            @RequestParam double longitude
    ) {
        List<ProcedurePackageWithClinicsDTO> packagesWithClinics = 
                customerClinicSearchService.getAllPackagesWithClinics(latitude, longitude);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "All procedure packages fetched successfully", packagesWithClinics)
        );
    }
}

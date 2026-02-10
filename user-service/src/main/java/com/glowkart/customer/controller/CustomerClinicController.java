package com.glowkart.customer.controller;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.ClinicDetailsDTO;
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
            @RequestParam String procedureId,
            @RequestParam String state // NEW: state from frontend
    ) {
        List<ClinicProcedureLinkDTO> clinics = customerClinicSearchService
                .findClinicsForProcedure(latitude, longitude, procedureId, state);

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
            @RequestParam double longitude,
            @RequestParam String state // NEW: state from frontend
    ) {
        List<ProcedurePackageWithClinicsDTO> packagesWithClinics =
                customerClinicSearchService.getAllPackagesWithClinics(latitude, longitude, state);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "All procedure packages fetched successfully", packagesWithClinics)
        );
    }
    
    
    /**
     * Get all clinics near user location
     * Sorted by distance
     */
    @GetMapping("/customer/clinics/nearby")
    public ResponseEntity<ApiResponse<List<ClinicProcedureLinkDTO>>> getNearbyClinics(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam String state // NEW
    ) {
        List<ClinicProcedureLinkDTO> clinics = customerClinicSearchService
                .findNearbyClinics(latitude, longitude, state);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Nearby clinics fetched successfully", clinics)
        );
    }

    
    
    /**
     * Get details of a clinic including procedures and packages it offers
     */
    @GetMapping("/customer/clinics/{clinicId}/details")
    public ResponseEntity<ApiResponse<ClinicDetailsDTO>> getClinicDetails(
            @PathVariable String clinicId) {

        ClinicDetailsDTO clinicDetails = customerClinicSearchService.getClinicDetails(clinicId);

        return ResponseEntity.ok(new ApiResponse<>(true, "Clinic details fetched successfully", clinicDetails));
    }
    
//    Used for Offers → Clinics list
    
    @GetMapping("/customer/offers/clinics/nearby")
    public ResponseEntity<ApiResponse<List<ClinicProcedureLinkDTO>>> getNearbyClinicsWithOffers(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam String state // NEW
    ) {
        List<ClinicProcedureLinkDTO> clinics =
                customerClinicSearchService.findNearbyClinicsWithOffers(latitude, longitude, state);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Nearby clinics with offers fetched", clinics)
        );
    }

//    Used when user taps a clinic from Offers screen
    
    @GetMapping("/customer/offers/clinics/{clinicId}")
    public ResponseEntity<ApiResponse<ClinicDetailsDTO>> getClinicOffers(
            @PathVariable String clinicId
    ) {
        ClinicDetailsDTO dto =
                customerClinicSearchService.getClinicOffers(clinicId);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Clinic offers fetched", dto)
        );
    }

}

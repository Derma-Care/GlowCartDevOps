package com.glowkart.admin.controller;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ClinicPublicDTO;
import com.glowkart.admin.service.ClinicSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class ClinicPublicSearchController {

    private final ClinicSearchService clinicSearchService;

    // 🔥 Called by CUSTOMER-SERVICE
    @GetMapping("/public/clinics/by-state")
    public ApiResponse<List<ClinicPublicDTO>> getClinicsByState(
            @RequestParam String state,
            @RequestParam(required = false) Boolean online) {

        List<ClinicPublicDTO> clinics = clinicSearchService.getVerifiedClinicsByState(state, online);

        // ⭐ Inject dynamic hospitalOverallRating for each clinic
        clinics.forEach(dto -> {
            double rating = clinicSearchService.getClinicAverageRating(dto.getClinicId());
            dto.setHospitalOverallRating(rating);
        });

        return new ApiResponse<>(
                true,
                "Clinics fetched by state",
                clinics
        );
    }
}


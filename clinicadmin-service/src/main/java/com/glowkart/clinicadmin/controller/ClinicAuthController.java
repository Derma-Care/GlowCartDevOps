package com.glowkart.clinicadmin.controller;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ClinicLoginRequest;
import com.glowkart.clinicadmin.dto.ClinicLoginResponse;
import com.glowkart.clinicadmin.service.ClinicAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clinic-admin")
public class ClinicAuthController {

    private final ClinicAuthService authService;

    public ClinicAuthController(ClinicAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<ClinicLoginResponse>> login(@RequestBody ClinicLoginRequest request) {
        // Always returns structured ApiResponse
        return authService.login(request);
    }
}

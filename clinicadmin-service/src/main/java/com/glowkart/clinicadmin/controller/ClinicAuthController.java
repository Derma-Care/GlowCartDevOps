package com.glowkart.clinicadmin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ClinicLoginRequest;
import com.glowkart.clinicadmin.dto.ClinicLoginResponse;
import com.glowkart.clinicadmin.service.ClinicAuthService;

@RestController
@RequestMapping("/clinic-admin")
public class ClinicAuthController {

    @Autowired
    private ClinicAuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<ClinicLoginResponse>> login(@RequestBody ClinicLoginRequest request) {
        // Return the full ApiResponse from service
        ApiResponse<ClinicLoginResponse> response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}

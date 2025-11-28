package com.glowkart.clinicadmin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ClinicInfoDTO;
import com.glowkart.clinicadmin.dto.ClinicLoginRequest;
import com.glowkart.clinicadmin.service.ClinicAuthService;

@RestController
@RequestMapping("/clinic-admin")
public class ClinicAuthController {

    private final ClinicAuthService authService;

    public ClinicAuthController(ClinicAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<ClinicInfoDTO>> login(@RequestBody ClinicLoginRequest request) {
        return authService.login(request);
    }

}

package com.glowkart.clinicadmin.controller;

import com.glowkart.clinicadmin.dto.ClinicLoginResponse;
import com.glowkart.clinicadmin.service.ClinicAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/clinic-admin")
public class ClinicAuthController {

    @Autowired
    private ClinicAuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ClinicLoginResponse> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        ClinicLoginResponse response = authService.login(username, password);
        return ResponseEntity.ok(response);
    }
}

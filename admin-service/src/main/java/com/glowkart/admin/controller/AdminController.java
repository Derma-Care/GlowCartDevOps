package com.glowkart.admin.controller;

import com.glowkart.admin.dto.*;
import com.glowkart.admin.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // Register endpoint
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AdminResponseDTO>> register(@Valid @RequestBody AdminRegisterDTO request) {
        ApiResponse<AdminResponseDTO> response = adminService.registerAdmin(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminResponseDTO>> login(@Valid @RequestBody AdminLoginDTO request) {
        ApiResponse<AdminResponseDTO> response = adminService.loginAdmin(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(response);
    }
}
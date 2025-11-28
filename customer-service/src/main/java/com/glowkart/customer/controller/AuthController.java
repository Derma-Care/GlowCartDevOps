package com.glowkart.customer.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.customer.dto.*;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.service.CustomerService;
import com.glowkart.customer.service.OtpService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private OtpService otpService;

    // Step 1: Send OTP
    @PostMapping("/auth/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(@RequestBody @Valid OtpRequestDTO dto) {
        Customer customer = customerService.getCustomer(dto.getMobile()).getData();

        if (customer == null || !customer.isRegistrationCompleted()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Customer not registered or registration incomplete", null));
        }

        otpService.sendOtp(dto.getMobile());
        return ResponseEntity.ok(new ApiResponse<>(true, "OTP sent successfully", dto.getMobile()));
    }

    // Step 2: Verify OTP
    @PostMapping("/auth/verify-otp")
    public ResponseEntity<ApiResponse<Customer>> verifyOtp(@RequestBody @Valid OtpVerifyDTO dto) {
        boolean valid = otpService.verifyOtp(dto.getMobile(), dto.getOtp());

        if (!valid) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Invalid or expired OTP", null));
        }

        Customer customer = customerService.getCustomer(dto.getMobile()).getData();
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", customer));
    }
}

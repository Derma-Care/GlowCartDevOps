package com.glowkart.auth.controller;

import com.glowkart.auth.dto.*;
import com.glowkart.auth.feign.CustomerClient;
import com.glowkart.auth.model.Customer;
import com.glowkart.auth.service.NotificationProducer;
import com.glowkart.auth.service.OtpService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final CustomerClient customerClient;
    private final OtpService otpService;
    private final NotificationProducer notificationProducer;

    public AuthController(CustomerClient customerClient,
                          OtpService otpService,
                          NotificationProducer notificationProducer) {
        this.customerClient = customerClient;
        this.otpService = otpService;
        this.notificationProducer = notificationProducer;
    }

    @PostMapping("/auth/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(@RequestBody @Valid OtpRequestDTO dto) {
        otpService.sendOtp(dto.getMobile());
        return ResponseEntity.ok(new ApiResponse<>(true, "OTP sent", dto.getMobile(), 200));
    }

    @PostMapping("/auth/verify-otp")
    public ResponseEntity<ApiResponse<Customer>> verifyOtp(@RequestBody @Valid OtpVerifyDTO dto) {

        // 1️⃣ Verify OTP
        if (!otpService.verifyOtp(dto.getMobile(), dto.getOtp())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid OTP", null, 400));
        }

        // 2️⃣ Fetch customer via Feign
        Customer customer = customerClient.getCustomer(dto.getMobile());
        if (customer == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Customer not found", null, 404));
        }

        // 3️⃣ Update device token via Feign
        customerClient.updateDeviceToken(dto.getMobile(), dto.getDeviceToken());
        customer.setDeviceToken(dto.getDeviceToken()); // update local object for response

        // 4️⃣ Publish login success event
        notificationProducer.sendLoginSuccess(customer);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Login successful", customer, 200)
        );
    }
}

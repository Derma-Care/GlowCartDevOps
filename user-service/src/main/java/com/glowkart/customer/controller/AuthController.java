package com.glowkart.customer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CustomerRegisterDTO;
import com.glowkart.customer.dto.OtpRequestDTO;
import com.glowkart.customer.dto.OtpVerifyDTO;
import com.glowkart.customer.feign.CustomerClient;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.service.NotificationProducer;
import com.glowkart.customer.service.OtpService;

import jakarta.validation.Valid;

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
    public ResponseEntity<ApiResponse<Customer>> verifyOtp(
            @RequestBody @Valid OtpVerifyDTO dto) {

        // 1️⃣ Verify OTP
        if (!otpService.verifyOtp(dto.getMobile(), dto.getOtp())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Invalid OTP", null, 400));
        }

        // 2️⃣ Fetch customer
        ApiResponse<Customer> response =
                customerClient.getCustomer(dto.getMobile());

        Customer customer = response.getData();

        if (customer == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Customer not found", null, 404));
        }


        // 3️⃣ Update device token
        customerClient.updateDeviceToken(dto.getMobile(), dto.getDeviceToken());
        customer.setDeviceToken(dto.getDeviceToken());

        // 4️⃣ Publish event
        notificationProducer.sendLoginSuccess(customer);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Login successful", customer, 200)
        );
    }

}


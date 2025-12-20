package com.glowkart.customer.controller;

import com.glowkart.customer.dto.*;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.service.CustomerService;
import com.glowkart.customer.service.NotificationProducer;
import com.glowkart.customer.service.OtpService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final CustomerService customerService;
    private final OtpService otpService;
    private final NotificationProducer notificationProducer;

    public AuthController(CustomerService customerService,
                          OtpService otpService,
                          NotificationProducer notificationProducer) {
        this.customerService = customerService;
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
        Customer customer = customerService.getCustomer(dto.getMobile()).getData();

        // 3️⃣ Save device token
        customer.setDeviceToken(dto.getDeviceToken());
        customerService.saveCustomerEntity(customer);  // ✅ Use service layer

        // 4️⃣ Publish login success event
        notificationProducer.sendLoginSuccess(customer);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Login successful", customer, 200)
        );
    }

}

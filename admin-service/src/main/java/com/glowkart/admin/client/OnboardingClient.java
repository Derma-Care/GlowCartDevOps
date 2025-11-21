package com.glowkart.admin.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(
    name = "onboarding-service",   // Eureka service name
    fallback = OnboardingClientFallback.class
)
public interface OnboardingClient {

    @GetMapping("/onboard/verify")
    Map<String, Object> verifyToken(@RequestParam("token") String token);

    @PostMapping("/onboard/mark-used")
    void markUsed(@RequestBody Map<String, String> body);
}

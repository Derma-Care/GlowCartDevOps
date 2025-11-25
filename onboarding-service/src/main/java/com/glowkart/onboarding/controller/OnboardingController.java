package com.glowkart.onboarding.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.onboarding.dto.ApiResponse;
import com.glowkart.onboarding.dto.OnboardingTokenResponseDTO;
import com.glowkart.onboarding.dto.RequestLinkDTO;
import com.glowkart.onboarding.exception.BadRequestException;
import com.glowkart.onboarding.model.OnboardingToken;
import com.glowkart.onboarding.service.OnboardingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/onboard")
public class OnboardingController {

    private final OnboardingService service;
    private static final Logger logger = LoggerFactory.getLogger(OnboardingController.class);

    @Value("${app.return-token:false}")
    private boolean returnTokenInResponse;

    public OnboardingController(OnboardingService service) {
        this.service = service;
    }

    @PostMapping("/request-link")
    public ResponseEntity<ApiResponse<OnboardingTokenResponseDTO>> requestLink(@Valid @RequestBody RequestLinkDTO dto) {

        String token = service.createAndSendToken(dto.getWhatsappNumber(), dto.getEmail());
        OnboardingToken t = service.validateToken(token);

        OnboardingTokenResponseDTO response = new OnboardingTokenResponseDTO(
                t.getEmail(),
                t.getWhatsappNumber(),
                t.getCreatedAt(),
                t.getExpiresAt(),
                returnTokenInResponse ? t.getId() : null
        );

        logger.info("Generated onboarding token {} for {}", token, t.getEmail());

        return ResponseEntity.accepted()
                .body(new ApiResponse<>(true, "Link sent successfully", response));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<OnboardingTokenResponseDTO>> verify(@RequestParam String token) {
        OnboardingToken t = service.validateToken(token);

        OnboardingTokenResponseDTO response = new OnboardingTokenResponseDTO(
                t.getEmail(),
                t.getWhatsappNumber(),
                t.getCreatedAt(),
                t.getExpiresAt(),
                t.getId()
        );

        return ResponseEntity.ok(new ApiResponse<>(true, "Token valid", response));
    }

    @PostMapping("/mark-used")
    public ResponseEntity<ApiResponse<Object>> markUsed(@RequestBody Map<String, String> req) {
        String token = req.get("token");
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Token is missing");
        }

        service.markUsed(token);

        return ResponseEntity.ok(new ApiResponse<>(true, "Token marked as used", null));
    }
}

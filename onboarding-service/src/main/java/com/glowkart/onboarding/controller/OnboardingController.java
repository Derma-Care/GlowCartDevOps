package com.glowkart.onboarding.controller;

import java.util.Map;

import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.onboarding.dto.RequestLinkDTO;
import com.glowkart.onboarding.model.OnboardingToken;
import com.glowkart.onboarding.service.OnboardingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/onboard")
public class OnboardingController {

    private final OnboardingService service;
    private static final Logger logger = LoggerFactory.getLogger(OnboardingController.class);

    public OnboardingController(OnboardingService service) {
        this.service = service;
    }

    // 1. User requests onboarding link (Email/WhatsApp)
    @PostMapping("/request-link")
    public ResponseEntity<?> requestLink(@Valid @RequestBody RequestLinkDTO dto) {
        try {
            // Validate input and send the token link
            String token = service.createAndSendToken(dto.getWhatsappNumber(), dto.getEmail());
            logger.info("Onboarding token generated and link sent for: {}", dto.getEmail());

            return ResponseEntity.accepted()
                    .body(Map.of("message", "Link sent via provided channels"));
        } catch (IllegalArgumentException e) {
            logger.error("Invalid input for onboarding link request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error while processing onboarding link request: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal Server Error"));
        }
    }

    // 2. Validate token (from user's onboarding link)
    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String token) {

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token is missing or empty"));
        }

        try {
            OnboardingToken t = service.validateToken(token);

            logger.info("Token details: id={}, whatsappNumber={}, email={}, expiresAt={}",
                    t.getId(), t.getWhatsappNumber(), t.getEmail(), t.getExpiresAt());

            // Use HashMap because Map.of() does NOT allow null values
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", t.getId());
            response.put("whatsappNumber", t.getWhatsappNumber()); // null allowed
            response.put("email", t.getEmail());
            response.put("expiresAt", t.getExpiresAt());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid token: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during token verification", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal Server Error"));
        }
    }


    // 3. Mark token as used after onboarding completes
    @PostMapping("/mark-used")
    public ResponseEntity<?> markUsed(@RequestBody Map<String, String> body) {
        String token = body.get("token");

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token is missing or empty"));
        }

        try {
            service.markUsed(token);
            logger.info("Token marked as used: {}", token);
            return ResponseEntity.ok(Map.of("message", "Token marked as used"));
        } catch (Exception e) {
            logger.error("Error marking token as used: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to mark token as used: " + e.getMessage()));
        }
    }
}

package com.glowkart.onboarding.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OnboardingTokenResponseDTO {
    private String email;
    private String whatsappNumber;
    private Instant createdAt;
    private Instant expiresAt;
    private String token; // optional, only in dev/testing mode
}

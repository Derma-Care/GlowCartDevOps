package com.glowkart.onboarding.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "onboarding_tokens")
public class OnboardingToken {
    @Id
    private String id; // UUID token

    private String whatsappNumber; // optional
    private String email; // optional

    private Instant createdAt;
    private Instant expiresAt;
    private boolean used; // flag for whether the token has been used
}

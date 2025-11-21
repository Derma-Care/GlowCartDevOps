package com.glowkart.onboarding.repo;

import com.glowkart.onboarding.model.OnboardingToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.Optional;

public interface OnboardingTokenRepository extends MongoRepository<OnboardingToken, String> {

    // Find a token by ID that hasn't been used yet
    Optional<OnboardingToken> findByIdAndUsedFalse(String id);

    // Find a token by email that hasn't been used yet
    Optional<OnboardingToken> findByEmailAndUsedFalse(String email);

    // Find a token by email where the token is not expired and hasn't been used
    Optional<OnboardingToken> findByEmailAndUsedFalseAndExpiresAtAfter(String email, Instant now);
}

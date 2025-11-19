package com.glowkart.onboarding.repo;

import com.glowkart.onboarding.model.OnboardingToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OnboardingTokenRepository extends MongoRepository<OnboardingToken, String> {
    Optional<OnboardingToken> findByIdAndUsedFalse(String id);
}

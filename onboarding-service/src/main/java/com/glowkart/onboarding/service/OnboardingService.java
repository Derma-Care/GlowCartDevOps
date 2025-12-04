package com.glowkart.onboarding.service;

import com.glowkart.onboarding.model.OnboardingToken;

public interface OnboardingService {
	  String createAndSendToken(String whatsappNumber, String email, String name);
    OnboardingToken validateToken(String token);
    void markUsed(String token);
}

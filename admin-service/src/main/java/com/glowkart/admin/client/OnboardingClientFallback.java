package com.glowkart.admin.client;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class OnboardingClientFallback implements OnboardingClient {

    @Override
    public Map<String, Object> verifyToken(String token) {
        throw new RuntimeException("Onboarding service unavailable. Please try again later.");
    }

    @Override
    public void markUsed(Map<String, String> body) {
        System.out.println("[Fallback] Unable to mark token as used. Service unavailable.");
    }
}

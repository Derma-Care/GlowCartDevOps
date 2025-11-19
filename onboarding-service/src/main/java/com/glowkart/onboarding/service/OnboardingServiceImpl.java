package com.glowkart.onboarding.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.glowkart.onboarding.model.OnboardingToken;
import com.glowkart.onboarding.repo.OnboardingTokenRepository;

@Service
public class OnboardingServiceImpl implements OnboardingService {

    private static final Logger logger = LoggerFactory.getLogger(OnboardingServiceImpl.class);

    private final OnboardingTokenRepository repo;
    private final WhatsAppSender whatsAppSender;
    private final EmailSender emailSender;
    private final String frontendBaseUrl;
    private final Duration expiry;

    public OnboardingServiceImpl(OnboardingTokenRepository repo,
                                 WhatsAppSender whatsAppSender,
                                 EmailSender emailSender,
                                 @Value("${app.frontend-base-url}") String frontendBaseUrl,
                                 @Value("${app.token-expiry-minutes}") long expiryMinutes) {
        this.repo = repo;
        this.whatsAppSender = whatsAppSender;
        this.emailSender = emailSender;
        this.frontendBaseUrl = frontendBaseUrl;
        this.expiry = Duration.ofMinutes(expiryMinutes);
    }

    @Override
    public String createAndSendToken(String whatsappNumber, String email) {
        if ((whatsappNumber == null || whatsappNumber.isBlank()) && 
            (email == null || email.isBlank())) {
            throw new IllegalArgumentException("Provide either WhatsApp number or Email");
        }

        // Generate a unique token
        String token = UUID.randomUUID().toString();
        Instant now = Instant.now();

        // Create and save the token to the database
        OnboardingToken t = new OnboardingToken();
        t.setId(token);
        t.setWhatsappNumber(whatsappNumber);
        t.setEmail(email);
        t.setCreatedAt(now);
        t.setExpiresAt(now.plus(expiry));
        t.setUsed(false);

        try {
            repo.save(t);
            logger.info("Token created and saved: {}", token);
        } catch (Exception e) {
            logger.error("Error saving token to database", e);
            throw new RuntimeException("Error saving token to database");
        }

        // Generate link and send it via email/whatsapp
        String link = String.format("%s/onboard?token=%s", frontendBaseUrl, token);
        if (whatsappNumber != null && !whatsappNumber.isBlank()) {
            whatsAppSender.sendWhatsAppLink(whatsappNumber, link);
        }
        if (email != null && !email.isBlank()) {
            emailSender.sendEmailLink(email, link);
        }

        return token;
    }

    @Override
    public OnboardingToken validateToken(String token) {
        // Debugging step: Check the token value
        logger.info("Validating token: {}", token);

        // Use 'repo' to access the token from the database
        Optional<OnboardingToken> optionalToken = repo.findById(token); // Use findById instead of findByToken

        if (!optionalToken.isPresent()) {
            logger.error("Token not found in database");
            throw new IllegalArgumentException("Invalid token");
        }

        OnboardingToken t = optionalToken.get();

        // Check if the token has expired
        if (t.getExpiresAt() != null && t.getExpiresAt().isBefore(Instant.now())) {
            logger.error("Token has expired");
            throw new IllegalArgumentException("Token has expired");
        }

        return t;
    }

    @Override
    public void markUsed(String token) {
        // Mark the token as used after successful validation
        Optional<OnboardingToken> optionalToken = repo.findById(token);
        if (optionalToken.isPresent()) {
            OnboardingToken t = optionalToken.get();
            t.setUsed(true);
            try {
                repo.save(t);
                logger.info("Token marked as used: {}", token);
            } catch (Exception e) {
                logger.error("Error marking token as used: {}", e.getMessage());
                throw new RuntimeException("Error marking token as used");
            }
        } else {
            logger.error("Token not found for marking as used: {}", token);
            throw new IllegalArgumentException("Token not found");
        }
    }
}

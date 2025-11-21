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

        // Check for existing active token
        Optional<OnboardingToken> existingTokenOpt = repo.findByEmailAndUsedFalse(email);

        if (existingTokenOpt.isPresent()) {
            OnboardingToken existingToken = existingTokenOpt.get();

            if (existingToken.getExpiresAt().isAfter(Instant.now()) && !existingToken.isUsed()) {

                String link = String.format("%s/clinic-registration?token=%s",
                        frontendBaseUrl, existingToken.getId());

                sendLink(whatsappNumber, email, link);
                logger.info("Re-sending existing token: {}", existingToken.getId());
                return existingToken.getId();
            } else {
                repo.delete(existingToken);
            }
        }

        // Create new token
        String token = UUID.randomUUID().toString();
        Instant now = Instant.now();

        OnboardingToken newToken = new OnboardingToken();
        newToken.setId(token);
        newToken.setWhatsappNumber(whatsappNumber);
        newToken.setEmail(email);
        newToken.setCreatedAt(now);
        newToken.setExpiresAt(now.plus(expiry));
        newToken.setUsed(false);

        repo.save(newToken);

        String link = String.format("%s/clinic-registration?token=%s",
                frontendBaseUrl, token);

        sendLink(whatsappNumber, email, link);

        return token;
    }

    private void sendLink(String whatsappNumber, String email, String link) {
        if (whatsappNumber != null && !whatsappNumber.isBlank()) {
            whatsAppSender.sendWhatsAppLink(whatsappNumber, link);
        }
        if (email != null && !email.isBlank()) {
            emailSender.sendEmailLink(email, link);
        }
    }

    @Override
    public OnboardingToken validateToken(String token) {
        Optional<OnboardingToken> optionalToken = repo.findById(token);
        if (!optionalToken.isPresent()) {
            throw new IllegalArgumentException("Invalid token");
        }

        OnboardingToken t = optionalToken.get();

        if (t.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Token has expired");
        }

        if (t.isUsed()) {
            throw new IllegalArgumentException("Token already used");
        }

        return t;
    }

    @Override
    public void markUsed(String token) {

        Optional<OnboardingToken> optionalToken = repo.findById(token);

        if (!optionalToken.isPresent()) {
            throw new IllegalArgumentException("Token not found");
        }

        OnboardingToken t = optionalToken.get();
        t.setUsed(true);
        repo.save(t);
    }
}

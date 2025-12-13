package com.glowkart.onboarding.service;

import com.glowkart.onboarding.exception.BadRequestException;
import com.glowkart.onboarding.exception.ResourceNotFoundException;
import com.glowkart.onboarding.model.OnboardingToken;
import com.glowkart.onboarding.repo.OnboardingTokenRepository;

import jakarta.mail.MessagingException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class OnboardingServiceImpl implements OnboardingService {

    private static final Logger logger = LoggerFactory.getLogger(OnboardingServiceImpl.class);

    private final OnboardingTokenRepository repo;
    private final WhatsAppSender whatsAppSender;
    private final EmailSender emailSender;
    private final Duration expiry;

    public OnboardingServiceImpl(OnboardingTokenRepository repo,
                                 WhatsAppSender whatsAppSender,
                                 EmailSender emailSender,
                                 @Value("${app.token-expiry-minutes}") long expiryMinutes) {
        this.repo = repo;
        this.whatsAppSender = whatsAppSender;
        this.emailSender = emailSender;
        this.expiry = Duration.ofMinutes(expiryMinutes);
    }

    @Override
    public String createAndSendToken(String whatsappNumber, String email, String name) {

        // --- 1. Validate Inputs ---
        if (isBlank(whatsappNumber) && isBlank(email)) {
            throw new BadRequestException("Provide either WhatsApp number or Email");
        }

        Instant now = Instant.now();
        OnboardingToken tokenToSend = null;

        // --- 2. Check if email is already used completely ---
        if (!isBlank(email)) {
            repo.findByEmailAndUsedTrue(email).ifPresent(t -> {
                throw new BadRequestException("This email has already completed onboarding");
            });
        }

        // --- 3. Reuse existing valid email token ---
        if (!isBlank(email)) {
            tokenToSend = repo.findByEmailAndUsedFalseAndExpiresAtAfter(email, now)
                              .orElse(null);
        }

        // --- 4. Reuse existing valid WhatsApp token ---
        if (tokenToSend == null && !isBlank(whatsappNumber)) {
            tokenToSend = repo.findByWhatsappNumberAndUsedFalseAndExpiresAtAfter(whatsappNumber, now)
                              .orElse(null);
        }

        // --- 5. Create new token if needed ---
        if (tokenToSend == null) {
            tokenToSend = new OnboardingToken();
            tokenToSend.setId(UUID.randomUUID().toString());
            tokenToSend.setEmail(email);
            tokenToSend.setWhatsappNumber(whatsappNumber);
            tokenToSend.setCreatedAt(now);
            tokenToSend.setExpiresAt(now.plus(expiry));
            tokenToSend.setUsed(false);

            repo.save(tokenToSend);
            logger.info("Created new token {}", tokenToSend.getId());
        } else {
            logger.info("Reusing existing active token {}", tokenToSend.getId());
        }

        // --- 6. Send Email Safely ---
        if (!isBlank(email)) {
            try {
                emailSender.sendOnboardingEmail(email, tokenToSend.getId(), email, whatsappNumber, name);
            } catch (MessagingException e) {
                logger.error("Failed to send onboarding email to {}", email, e);
            }
        }

        // --- 7. Send WhatsApp Safely ---
        if (!isBlank(whatsappNumber)) {
            try {
                whatsAppSender.sendOnboardingWhatsApp(whatsappNumber, tokenToSend.getId(), email, whatsappNumber, name);
            } catch (Exception e) {
                logger.error("Failed to send onboarding WhatsApp to {}", whatsappNumber, e);
            }
        }

        return tokenToSend.getId();
    }

    // --- Helper Method ---
    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }



    @Override
    public OnboardingToken validateToken(String token) {
        OnboardingToken t = repo.findById(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid token"));

        if (t.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Token has expired");
        }

        if (t.isUsed()) {
            throw new BadRequestException("Token already used");
        }

        return t;
    }

    @Override
    public void markUsed(String token) {
        OnboardingToken t = repo.findById(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found"));

        t.setUsed(true);
        repo.save(t);
    }
}

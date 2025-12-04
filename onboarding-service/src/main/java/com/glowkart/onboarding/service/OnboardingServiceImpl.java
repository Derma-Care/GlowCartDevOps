package com.glowkart.onboarding.service;

import com.glowkart.onboarding.exception.BadRequestException;
import com.glowkart.onboarding.exception.ResourceNotFoundException;
import com.glowkart.onboarding.model.OnboardingToken;
import com.glowkart.onboarding.repo.OnboardingTokenRepository;

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
        if ((whatsappNumber == null || whatsappNumber.isBlank()) &&
            (email == null || email.isBlank())) {
            throw new BadRequestException("Provide either WhatsApp number or Email");
        }

        Instant now = Instant.now();
        OnboardingToken tokenToSend = null;

        if (email != null && !email.isBlank()) {
            Optional<OnboardingToken> usedEmail = repo.findByEmailAndUsedTrue(email);
            if (usedEmail.isPresent()) {
                throw new BadRequestException("This email has already completed onboarding");
            }
        }

        if (email != null && !email.isBlank()) {
            Optional<OnboardingToken> active = repo.findByEmailAndUsedFalseAndExpiresAtAfter(email, now);
            if (active.isPresent()) tokenToSend = active.get();
        }

        if (tokenToSend == null && whatsappNumber != null && !whatsappNumber.isBlank()) {
            Optional<OnboardingToken> active = repo.findByWhatsappNumberAndUsedFalseAndExpiresAtAfter(whatsappNumber, now);
            if (active.isPresent()) tokenToSend = active.get();
        }

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

        // Send Email and WhatsApp with dynamic name
        if (email != null && !email.isBlank()) {
            emailSender.sendOnboardingEmail(email, tokenToSend.getId(), email, whatsappNumber, name);
        }
        if (whatsappNumber != null && !whatsappNumber.isBlank()) {
            whatsAppSender.sendOnboardingWhatsApp(whatsappNumber, tokenToSend.getId(), email, whatsappNumber, name);
        }

        return tokenToSend.getId();
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

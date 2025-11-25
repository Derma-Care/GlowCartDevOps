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
            throw new BadRequestException("Provide either WhatsApp number or Email");
        }

        Optional<OnboardingToken> existingTokenOpt = email != null && !email.isBlank()
                ? repo.findByEmailAndUsedFalse(email)
                : Optional.empty();

        if (existingTokenOpt.isPresent()) {
            OnboardingToken existing = existingTokenOpt.get();

            if (existing.getExpiresAt().isAfter(Instant.now()) && !existing.isUsed()) {
                String link = getOnboardingLink(existing.getId());
                sendLink(whatsappNumber, email, link);
                logger.info("Re-sent onboarding link for existing token {}", existing.getId());
                return existing.getId();
            } else {
                repo.delete(existing);
            }
        }

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

        sendLink(whatsappNumber, email, getOnboardingLink(token));

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

    private String getOnboardingLink(String token) {
        return frontendBaseUrl + "/clinic-registration?token=" + token;
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

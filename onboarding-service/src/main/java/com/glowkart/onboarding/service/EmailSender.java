package com.glowkart.onboarding.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class EmailSender {

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String frontendBaseUrl;

    public EmailSender(JavaMailSender mailSender,
                       @Value("${notification.default-from-email:no-reply@glowkart.com}") String fromEmail,
                       @Value("${app.frontend-base-url}") String frontendBaseUrl) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public void sendOnboardingEmail(String to, String token, String email, String whatsappNumber) {
        if (to == null || to.isBlank()) return;

        String link = buildOnboardingLink(token, email, whatsappNumber);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Complete Your Clinic Onboarding");
        message.setText(
                "👋 Complete your clinic onboarding: " + link +
                "\n(Expires in 60 minutes)"
        );

        mailSender.send(message);
    }

    private String buildOnboardingLink(String token, String email, String whatsappNumber) {
        StringBuilder link = new StringBuilder(frontendBaseUrl)
                .append("/clinic-registration?token=").append(token);

        try {
            if (email != null && !email.isBlank()) {
                link.append("&email=").append(URLEncoder.encode(email, StandardCharsets.UTF_8));
            }
            if (whatsappNumber != null && !whatsappNumber.isBlank()) {
                link.append("&whatsappNumber=").append(URLEncoder.encode(whatsappNumber, StandardCharsets.UTF_8));
            }
        } catch (Exception e) {
            throw new RuntimeException("URL encoding failed", e);
        }

        return link.toString();
    }
}

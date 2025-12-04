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

    public void sendOnboardingEmail(String to, String token, String email, String whatsappNumber, String name) {
        if (to == null || to.isBlank()) return;

        String link = buildOnboardingLink(token, email, whatsappNumber);
        String displayName = (name != null && !name.isBlank()) ? name : "User";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("✨ GlowKart Clinic Registration – Complete Your Onboarding ✨");
        message.setText(
            "👋 Dear " + displayName + ",\n\n" +
            "Thank you for choosing GlowKart.\n" +
            "To complete your clinic onboarding, please use the secure link below:\n\n" +
            "🔗 Complete Registration:\n" +
            link + "\n\n" +
            "⏰ Please note that this link is valid for 60 minutes.\n" +
            "❗ If you did not request this registration, please ignore this email.\n\n" +
            "🙏 Thank you,\n" +
            "GlowKart Team"
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

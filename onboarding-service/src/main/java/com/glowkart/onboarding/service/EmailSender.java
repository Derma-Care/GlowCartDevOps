package com.glowkart.onboarding.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailSender {

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailSender(JavaMailSender mailSender,
                       @Value("${notification.default-from-email:no-reply@glowkart.com}") String fromEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    // Send onboarding link without encoding (fixed)
    public void sendEmailLink(String to, String link) {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("Recipient email cannot be null or empty");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Complete Your Clinic Onboarding");

        message.setText("👋 Complete your clinic onboarding: " + link +
                        "\n(Expires in 60 minutes)");

        mailSender.send(message);
    }
}

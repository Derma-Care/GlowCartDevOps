package com.glowkart.onboarding.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

@Service
public class EmailSender {

    private final JavaMailSender mailSender;
    private final String fromEmail;

    // Inject the default "from" email from application.yml
    public EmailSender(JavaMailSender mailSender,
                       @Value("${notification.default-from-email:no-reply@glowkart.com}") String fromEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    // Method to send the onboarding link
    public void sendEmailLink(String to, String link) {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("Recipient email cannot be null or empty");
        }

        try {
            // If the link contains a token, encode it
            String encodedLink = link.split("\\?")[0] + "?token=" + URLEncoder.encode(link.split("\\?")[1], "UTF-8");

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Complete Your Clinic Onboarding");
            message.setText("👋 Complete your clinic onboarding: " + encodedLink + "\n(Expires in 60 minutes)");

            mailSender.send(message);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Error encoding the URL", e);
        }
    }
}

package com.glowkart.admin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender, Environment env) {
        this.mailSender = mailSender;
        this.fromAddress = env.getProperty("notification.default-from-email", "no-reply@glowkart.com");
    }

    public void sendEmail(String to, Map<String, String> data) {
        try {
            if (to == null || to.isBlank()) {
                logger.warn("Email not sent: recipient address is blank");
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setFrom(fromAddress);
            message.setSubject(data.getOrDefault("subject", "GlowKart Clinic Notification"));
            message.setText(buildMessageBody(data));

            mailSender.send(message);
            logger.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }

    private String buildMessageBody(Map<String, String> data) {
        String statusMessage = data.getOrDefault("message", "Your clinic status has been updated.");
        String username = data.get("username");
        String password = data.get("password");

        StringBuilder body = new StringBuilder();
        body.append("Hello,\n\n");

        if (username != null && password != null) {
            body.append("Your clinic has been verified.\n\n")
                .append("Username: ").append(username).append("\n")
                .append("Password: ").append(password).append("\n\n");
        } else {
            body.append(statusMessage).append("\n\n");
        }

        body.append("Regards,\nGlowKart Team");
        return body.toString();
    }
}

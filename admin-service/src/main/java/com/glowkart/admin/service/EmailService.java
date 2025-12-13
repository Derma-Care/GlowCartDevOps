package com.glowkart.admin.service;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

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

            String subject = data.getOrDefault("subject", "GlowKart Notification");

            String emoji = "";
            if (subject.contains("Verified")) emoji = "🎉";
            else if (subject.contains("Pending")) emoji = "⏳";
            else if (subject.contains("Rejected")) emoji = "❌";
            else if (subject.contains("OTP")) emoji = "🔒";

            String subjectWithEmoji = emoji.isEmpty() ? subject : emoji + " " + subject;

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom(fromAddress);
            helper.setSubject(subjectWithEmoji);
            helper.setText(buildMessageBody(data, emoji), true);

            mailSender.send(mimeMessage);
            logger.info("Email sent successfully to {}", to);

        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }

    private String buildMessageBody(Map<String, String> data, String emoji) {

        String bodyMessage = data.getOrDefault("message", "");
        String otpType = data.get("otpType");

        String username = data.get("username");
        String password = data.get("password");
        String payoutUsername = data.get("payoutUsername");
        String payoutPassword = data.get("payoutPassword");

        String clinicLoginUrl = "https://glowkartclinic.ashokfruit.shop/login";

        String greetingEmoji = "👋";

        StringBuilder body = new StringBuilder();
        body.append(String.format("""
        	    <html>
        	    <body style="font-family: Arial; font-size: 15px; color: #333;">
        	    <p>%s Hello,</p>
        	""", greetingEmoji));

        // OTP TYPE DISPLAY
        if (otpType != null) {
            if (otpType.equals("PAYOUT_PASSWORD_RESET")) {
                body.append("<h3 style='color:#D2025B;'>Payout Password Reset OTP</h3>");
            } else {
                body.append("<h3 style='color:#D2025B;'>Clinic Login Password Reset OTP</h3>");
            }
        }

        if (!emoji.isEmpty()) {
            body.append("<p>").append(emoji).append(" ").append(bodyMessage.replace("\n", "<br>")).append("</p>");
        } else {
            body.append("<p>").append(bodyMessage.replace("\n", "<br>")).append("</p>");
        }

        body.append("""
            <p style="text-align:center;">
               
            </p>
        """.formatted(clinicLoginUrl));

        if (username != null && password != null) {
            body.append("""
                <h3 style="color:#D2025B;">Clinic Login Credentials</h3>
                <p><b>Username:</b> %s<br><b>Password:</b> %s</p>
            """.formatted(username, password));
        }

        if (payoutUsername != null && payoutPassword != null) {
            body.append("""
                <h3 style="color:#D2025B;">Payout Login Credentials</h3>
                <p><b>Payout Username:</b> %s<br><b>Payout Password:</b> %s</p>
            """.formatted(payoutUsername, payoutPassword));
        }

        body.append("""
            <p>🙏 Thank you,<br><b>GlowKart Team</b></p>
            </body></html>
        """);

        return body.toString();
    }
}

package com.glowkart.onboarding.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

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

    public void sendOnboardingEmail(String to, String token, String email, String whatsappNumber, String name) throws MessagingException {
        if (to == null || to.isBlank()) return;

        String link = buildOnboardingLink(token, email, whatsappNumber);
        String displayName = (name != null && !name.isBlank()) ? name : "User";

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        String htmlContent = """
        	    <html>
        	    <body style="margin:0; padding:0; font-family: Arial, sans-serif; font-size: 15px; color:#333;">
        	        <table width="100%%" cellpadding="0" cellspacing="0" border="0">
        	            <tr>
        	                <td align="center">
        	                    <table width="600" cellpadding="20" cellspacing="0" border="0" style="
        	                        max-width:600px; 
        	                        background-color:#ffffff; 
        	                        border:1px solid #e0e0e0; 
        	                        border-radius:8px;
        	                    ">
        	                        <tr>
        	                            <td>
        	                                <p>👋 Dear <strong>%s</strong>,</p>
        	                                <p>Thank you for choosing <strong>GlowKart</strong>.</p>
        	                                <p>To complete your clinic onboarding, please click the secure button below:</p>

        	                                <p style="text-align:center;">
        	                                    <a href="%s" style="
        	                                        display:inline-block;
        	                                        padding:12px 20px;
        	                                        background-color:#D2025B;
        	                                        color:#ffffff !important;
        	                                        text-decoration:none;
        	                                        border-radius:5px;
        	                                        font-weight:bold;
        	                                        font-size:16px;
        	                                    ">Complete Registration</a>
        	                                </p>

        	                                <p>⏰ <strong>Please note:</strong> This link is valid for <strong>60 minutes</strong>.</p>
        	                                <p>❗ If you did not request this registration, please ignore this email.</p>

        	                                <br>
        	                                <p>🙏 Thank you,<br><strong>GlowKart Team</strong></p>
        	                            </td>
        	                        </tr>
        	                    </table>
        	                </td>
        	            </tr>
        	        </table>
        	    </body>
        	    </html>
        	""".formatted(displayName, link);


        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("✨ GlowKart Clinic Registration – Complete Your Onboarding ✨");
        helper.setText(htmlContent, true); // true = HTML

        mailSender.send(mimeMessage);
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

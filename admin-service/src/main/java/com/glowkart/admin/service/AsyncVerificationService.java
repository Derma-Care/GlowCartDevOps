package com.glowkart.admin.service;

import com.glowkart.admin.model.Clinic;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AsyncVerificationService {

    private final EmailService emailService;
    private final WhatsAppService whatsAppService;

    public AsyncVerificationService(EmailService emailService, WhatsAppService whatsAppService) {
        this.emailService = emailService;
        this.whatsAppService = whatsAppService;
    }

    // 1. Registration Pending
    @Async
    public void sendAcknowledgementAsync(Clinic clinic) {
        Map<String, String> data = new HashMap<>();

        data.put("subject", "GlowKart Registration Pending");
        data.put("message",
                "Thank you for registering with GlowKart. Your registration is currently pending, and we are preparing "
                        + "to begin the review process shortly.\n"
                        + "We will notify you as soon as our team starts verifying your details.");

        emailService.sendEmail(clinic.getEmail(), data);
        whatsAppService.sendWhatsApp(clinic.getWhatsappNumber(), data);
    }

    // 2. Review Started
    @Async
    public void sendVerificationStartedAsync(Clinic clinic) {
        Map<String, String> data = new HashMap<>();

        data.put("subject", "GlowKart Registration Review Initiated");
        data.put("message",
                "We’re pleased to inform you that the review of your GlowKart registration has officially begun. "
                        + "Our team is carefully verifying your submitted details.\n"
                        + "You will receive an update as soon as the process is complete.");

        emailService.sendEmail(clinic.getEmail(), data);
        whatsAppService.sendWhatsApp(clinic.getWhatsappNumber(), data);
    }

    // 3. Registration Verified
    @Async
    public void sendCredentialsAsync(Clinic clinic) {
        Map<String, String> data = new HashMap<>();

        data.put("subject", "Your GlowKart Registration Has Been Verified");
        data.put("message",
                "Great news! Your GlowKart registration has been successfully verified.\n"
                        + "You can now log in and begin using your account without any restrictions.\n\n"
                        + "If you need any assistance, feel free to reach out to us.\n\n"
                        + "Welcome to GlowKart!");

        data.put("username", clinic.getUsername());
        data.put("password", clinic.getPassword());

        emailService.sendEmail(clinic.getEmail(), data);
        whatsAppService.sendWhatsApp(clinic.getWhatsappNumber(), data);
    }

    // 4. Registration Rejected
    @Async
    public void sendRejectionNotificationAsync(Clinic clinic, String reason) {
        Map<String, String> data = new HashMap<>();

        data.put("subject", "GlowKart Registration Status – Rejected");
        data.put("message",
                "Thank you for registering with GlowKart. After reviewing your submission, we are unable to approve "
                        + "your registration at this time.\n"
                        + "Reason for rejection: " + reason + "\n\n"
                        + "You may correct the issue and reapply at any time. If you have questions or believe this "
                        + "was an error, please contact our support team.");

        emailService.sendEmail(clinic.getEmail(), data);
        whatsAppService.sendWhatsApp(clinic.getWhatsappNumber(), data);
    }
}

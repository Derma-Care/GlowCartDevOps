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

    // Send acknowledgement when the clinic is in PENDING status
    @Async
    public void sendAcknowledgementAsync(Clinic clinic) {
        Map<String, String> data = new HashMap<>();
        // Adding greeting and signature
        data.put("message", 
                  "Hello,\n\n" + 
                  "We have received your registration and are reviewing it.\n\n" +
                  "Regards,\nGlowKart Team");
        data.put("subject", "GlowKart Clinic Registration Pending");
        // Send email and WhatsApp messages
        emailService.sendEmail(clinic.getEmail(), data);
        whatsAppService.sendWhatsApp(clinic.getWhatsappNumber(), data);
    }

    // Send notification when the clinic verification process has started
    @Async
    public void sendVerificationStartedAsync(Clinic clinic) {
        Map<String, String> data = new HashMap<>();
        // Adding greeting and signature
        data.put("message", 
                  "Hello,\n\n" + 
                  "Your clinic verification process has started.\n\n" +
                  "Regards,\nGlowKart Team");
        data.put("subject", "GlowKart Clinic Verification Started");
        // Send email and WhatsApp messages
        emailService.sendEmail(clinic.getEmail(), data);
        whatsAppService.sendWhatsApp(clinic.getWhatsappNumber(), data);
    }

    // Send credentials to the clinic when the clinic is VERIFIED
    @Async
    public void sendCredentialsAsync(Clinic clinic) {
        Map<String, String> data = new HashMap<>();
        data.put("username", clinic.getUsername());
        data.put("password", clinic.getPassword());
        // Adding greeting and signature along with credentials
        data.put("message", 
                  "Hello,\n\n" + 
                  "Your clinic has been successfully verified.\n\n" +
                  "Username: " + clinic.getUsername() + "\nPassword: " + clinic.getPassword() + 
                  "\n\nRegards,\nGlowKart Team");
        data.put("subject", "GlowKart Clinic Verified Successfully");
        // Send email and WhatsApp messages
        emailService.sendEmail(clinic.getEmail(), data);
        whatsAppService.sendWhatsApp(clinic.getWhatsappNumber(), data);
    }

    // Send rejection notification if the clinic is REJECTED
    @Async
    public void sendRejectionNotificationAsync(Clinic clinic, String reason) {
        Map<String, String> data = new HashMap<>();
        // Adding greeting and signature along with rejection reason
        data.put("message", 
                  "Hello,\n\n" + 
                  "We regret to inform you that your clinic registration has been rejected.\n\n" +
                  "Reason: " + reason + "\n\n" +
                  "Regards,\nGlowKart Team");
        data.put("subject", "GlowKart Clinic Registration Rejected");
        // Send email and WhatsApp messages
        emailService.sendEmail(clinic.getEmail(), data);
        whatsAppService.sendWhatsApp(clinic.getWhatsappNumber(), data);
    }
}

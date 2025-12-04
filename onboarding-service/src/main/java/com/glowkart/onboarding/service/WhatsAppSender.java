package com.glowkart.onboarding.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class WhatsAppSender {

    private final String accountSid;
    private final String authToken;
    private final String from;
    private final String frontendBaseUrl;

    public WhatsAppSender(
            @Value("${twilio.account-sid:}") String accountSid,
            @Value("${twilio.auth-token:}") String authToken,
            @Value("${twilio.whatsapp-from:}") String from,
            @Value("${app.frontend-base-url}") String frontendBaseUrl
    ) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.from = from;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public void sendOnboardingWhatsApp(String to, String token, String email, String whatsappNumber, String name) {
        if (to == null || to.isBlank()) return;

        String link = buildOnboardingLink(token, email, whatsappNumber);
        String greeting = (name != null && !name.isBlank()) ? name : "User";

        // Mock mode
        if (accountSid.isBlank() || authToken.isBlank() || from.isBlank()) {
            System.out.println("[MOCK WHATSAPP] to=" + to + " message=Dear " + greeting + ", Complete onboarding: " + link);
            return;
        }

        Twilio.init(accountSid, authToken);

        String body = "Dear " + greeting + ",\n👋 Complete your clinic onboarding: " + link +
                      "\n(Expires in 60 minutes)";

        Message.creator(
                new PhoneNumber("whatsapp:" + to),
                new PhoneNumber("whatsapp:" + from),
                body
        ).create();
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

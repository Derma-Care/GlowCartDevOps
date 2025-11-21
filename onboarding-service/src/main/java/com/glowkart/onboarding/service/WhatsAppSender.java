package com.glowkart.onboarding.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppSender {

    private final String accountSid;
    private final String authToken;
    private final String from;

    // Safe constructor with defaults to avoid startup failure
    public WhatsAppSender(
            @Value("${twilio.account-sid:}") String accountSid,
            @Value("${twilio.auth-token:}") String authToken,
            @Value("${twilio.whatsapp-from:}") String from
    ) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.from = from;
    }

    // Send WhatsApp link (mock mode supported)
    public void sendWhatsAppLink(String to, String link) {

        // MOCK MODE if Twilio credentials missing
        if (accountSid.isBlank() || authToken.isBlank() || from.isBlank()) {
            System.out.println("[MOCK WHATSAPP] To=" + to + " Link=" + link);
            return;
        }

        // Initialize Twilio
        Twilio.init(accountSid, authToken);

        // No encoding needed; send link exactly as provided
        String body =
                "👋 Complete your clinic onboarding: " + link +
                "\n(Expires in 60 minutes)";

        // Send WhatsApp message
        Message.creator(
                new PhoneNumber("whatsapp:" + to),
                new PhoneNumber("whatsapp:" + from),
                body
        ).create();
    }
}

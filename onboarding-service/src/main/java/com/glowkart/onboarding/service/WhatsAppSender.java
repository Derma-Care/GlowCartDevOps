package com.glowkart.onboarding.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

@Service
public class WhatsAppSender {

    private final String accountSid;
    private final String authToken;
    private final String from;

    // Use default empty values to prevent startup crash
    public WhatsAppSender(
            @Value("${twilio.account-sid:}") String accountSid,
            @Value("${twilio.auth-token:}") String authToken,
            @Value("${twilio.whatsapp-from:}") String from
    ) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.from = from;
    }

    // Sends WhatsApp link or runs mock mode
    public void sendWhatsAppLink(String to, String link) {

        // Enable mock mode when Twilio creds are blank
        if (accountSid.isBlank() || authToken.isBlank() || from.isBlank()) {
            System.out.println("[MOCK WHATSAPP] To=" + to + " Link=" + link);
            return;
        }

        try {
            String encodedLink;

            // Safe check for token in the URL
            if (link.contains("?")) {
                String[] parts = link.split("\\?", 2);  // split only once
                String tokenPart = parts[1].replace("token=", "");
                encodedLink = parts[0] + "?token=" + URLEncoder.encode(tokenPart, "UTF-8");
            } else {
                encodedLink = link;
            }

            // Initialize Twilio
            Twilio.init(accountSid, authToken);

            String body =
                    "👋 Complete your clinic onboarding: " + encodedLink +
                    "\n(Expires in 60 minutes)";

            // Send WhatsApp message
            Message.creator(
                    new PhoneNumber("whatsapp:" + to),
                    new PhoneNumber("whatsapp:" + from),
                    body
            ).create();

        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Error encoding the URL", e);
        }
    }
}

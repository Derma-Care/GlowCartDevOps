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

    public WhatsAppSender(@Value("${twilio.account-sid}") String accountSid,
                          @Value("${twilio.auth-token}") String authToken,
                          @Value("${twilio.whatsapp-from}") String from) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.from = from;
    }

    // Mock mode for local if Twilio creds are not provided
    public void sendWhatsAppLink(String to, String link) {
        if (accountSid == null || accountSid.isBlank() ||
            authToken == null || authToken.isBlank() ||
            from == null || from.isBlank()) {
            System.out.println("[MOCK WHATSAPP] To=" + to + " Link=" + link);
            return;
        }

        try {
            // If the link contains a token, encode it
            String encodedLink = link.split("\\?")[0] + "?token=" + URLEncoder.encode(link.split("\\?")[1], "UTF-8");

            Twilio.init(accountSid, authToken);
            String body = "👋 Complete your clinic onboarding: " + encodedLink + "\n(Expires in 60 minutes)";

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

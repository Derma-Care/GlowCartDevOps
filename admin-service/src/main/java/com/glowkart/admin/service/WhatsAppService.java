package com.glowkart.admin.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class WhatsAppService {

    private final Logger logger = LoggerFactory.getLogger(WhatsAppService.class);

    private final String accountSid;
    private final String authToken;
    private final String fromNumber;

    public WhatsAppService(Environment env) {
        this.accountSid = env.getProperty("twilio.account-sid");
        this.authToken = env.getProperty("twilio.auth-token");
        this.fromNumber = env.getProperty("twilio.whatsapp-from");
    }

    @PostConstruct
    public void init() {
        if (accountSid == null || authToken == null || fromNumber == null) {
            logger.warn("Twilio credentials missing. WhatsApp messages will not be sent.");
        } else {
            Twilio.init(accountSid, authToken);
            logger.info("Twilio initialized successfully.");
        }
    }

    public void sendWhatsApp(String to, Map<String, String> data) {
        if (to == null || to.isBlank()) {
            logger.warn("WhatsApp message not sent: recipient number is blank");
            return;
        }

        try {
            Message.creator(
                    new PhoneNumber("whatsapp:" + to),
                    new PhoneNumber("whatsapp:" + fromNumber),
                    buildMessageBody(data)
            ).create();

            logger.info("WhatsApp message sent to {}", to);
        } catch (Exception e) {
            logger.error("WhatsApp sending failed to {}: {}", to, e.getMessage(), e);
        }
    }

    private String buildMessageBody(Map<String, String> data) {

        String bodyMessage = data.getOrDefault("message", "");
        String username = data.get("username");
        String password = data.get("password");

        StringBuilder body = new StringBuilder();
        body.append("Hello,\n\n");
        body.append(bodyMessage).append("\n\n");

        if (username != null && password != null) {
            body.append("Username: ").append(username).append("\n")
                .append("Password: ").append(password).append("\n\n");
        }

        body.append("Regards,\nGlowKart Team");

        return body.toString();
    }

}
